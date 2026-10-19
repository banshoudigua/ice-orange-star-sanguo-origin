const fs = require("fs");
const path = require("path");
const { getDb } = require("../db/connection");

const tinyPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAARElEQVR4nO3PQQ0AIBDAMMC/5+ONAvZoFSzZnQmTnQsAAAAAAADwbfYAAGjlyJEjR44cOXLkyJEjR44cOXKkBgAAAADgRgY1cAEeRB9vAAAAAABJRU5ErkJggg==";

function now() {
  return new Date().toISOString();
}

function uploadDir() {
  return path.resolve(__dirname, "../../public/uploads/images");
}

function publicPath(fileName) {
  return `/uploads/images/${fileName}`;
}

function slug(value) {
  return String(value || "image")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "image";
}

function ensureUploadDir(callback) {
  fs.mkdir(uploadDir(), { recursive: true }, callback);
}

function updateJob(jobId, fields, callback) {
  const db = getDb();
  const keys = Object.keys(fields);
  const sets = keys.map((key) => `${key} = ?`).join(", ");
  const values = keys.map((key) => fields[key]);
  values.push(jobId);
  db.run(`UPDATE image_generation_jobs SET ${sets}, updated_at = ? WHERE id = ?`, values.slice(0, -1).concat([now(), jobId]), callback);
}

function refreshBatch(batchId, callback) {
  const db = getDb();
  db.all("SELECT status FROM image_generation_jobs WHERE batch_id = ?", [batchId], (jobErr, rows) => {
    if (jobErr) {
      callback(jobErr);
      return;
    }
    const total = rows.length;
    const counts = {
      pending: 0,
      submitted: 0,
      generating: 0,
      saving: 0,
      success: 0,
      failed: 0,
      cancelled: 0
    };
    rows.forEach((row) => {
      counts[row.status] = (counts[row.status] || 0) + 1;
    });
    const done = counts.success + counts.failed + counts.cancelled;
    const progress = total ? Math.round((done / total) * 100) : 0;
    let status = "generating";
    if (done === total && counts.failed > 0) status = "finished_with_error";
    if (done === total && counts.failed === 0) status = "success";
    if (done === 0 && counts.pending === total) status = "pending";
    const finishedAt = done === total ? now() : null;
    db.run(
      `UPDATE image_generation_batches
       SET total_count = ?, pending_count = ?, submitted_count = ?, generating_count = ?, success_count = ?, failed_count = ?, progress = ?, status = ?, updated_at = ?, finished_at = COALESCE(?, finished_at)
       WHERE id = ?`,
      [total, counts.pending, counts.submitted, counts.generating + counts.saving, counts.success, counts.failed, progress, status, now(), finishedAt, batchId],
      callback
    );
  });
}

function saveGeneratedImage(job, response, callback) {
  ensureUploadDir((dirErr) => {
    if (dirErr) {
      callback(dirErr);
      return;
    }
    const first = response && response.data && response.data[0] ? response.data[0] : null;
    if (!first) {
      callback(new Error("云雾接口没有返回图片数据"));
      return;
    }
    const fileName = `${job.id}-${slug(job.title)}.png`;
    const filePath = path.join(uploadDir(), fileName);
    const responseName = `${job.id}-${slug(job.title)}.json`;
    const responsePath = path.join(uploadDir(), responseName);
    const writeResponse = (imageErr) => {
      if (imageErr) {
        callback(imageErr);
        return;
      }
      fs.writeFile(responsePath, JSON.stringify(response, null, 2), "utf8", (jsonErr) => {
        if (jsonErr) {
          callback(jsonErr);
          return;
        }
        callback(null, {
          imagePath: publicPath(fileName),
          responseJsonPath: publicPath(responseName)
        });
      });
    };

    if (first.b64_json) {
      fs.writeFile(filePath, Buffer.from(first.b64_json, "base64"), writeResponse);
      return;
    }
    if (first.url) {
      fetch(first.url).then((downloadResponse) => {
        downloadResponse.arrayBuffer().then((buffer) => {
          fs.writeFile(filePath, Buffer.from(buffer), writeResponse);
        }, writeResponse);
      }, writeResponse);
      return;
    }
    callback(new Error("图片数据缺少 b64_json 或 url"));
  });
}

function requestYunwu(job, callback) {
  const mode = process.env.IMAGE_GENERATION_MODE || "mock";
  const apiKey = process.env.YUNWU_API_KEY;
  if (mode === "mock" || !apiKey) {
    setTimeout(() => {
      callback(null, {
        created: Math.floor(Date.now() / 1000),
        data: [{
          b64_json: tinyPngBase64,
          revised_prompt: job.prompt
        }]
      });
    }, 160);
    return;
  }

  const body = {
    model: job.model || "gpt-image-2",
    prompt: job.prompt,
    size: job.size || "1024x1024",
    quality: job.quality || "auto",
    n: 1,
    background: "opaque",
    moderation: "auto"
  };

  fetch(process.env.YUNWU_IMAGE_API || "https://yunwu.ai/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  }).then((response) => {
    response.json().then((json) => {
      if (!response.ok) {
        callback(new Error(json.error ? json.error.message : `云雾接口请求失败：${response.status}`));
        return;
      }
      callback(null, json);
    }, callback);
  }, callback);
}

function completeJob(job, callback) {
  updateJob(job.id, { status: "submitted", progress: 20, submitted_at: now(), error_message: "" }, (submitErr) => {
    if (submitErr) {
      callback(submitErr);
      return;
    }
    refreshBatch(job.batch_id, () => {});
    updateJob(job.id, { status: "generating", progress: 50 }, (generateErr) => {
      if (generateErr) {
        callback(generateErr);
        return;
      }
      requestYunwu(job, (requestErr, response) => {
        if (requestErr) {
          updateJob(job.id, { status: "failed", progress: 100, error_message: requestErr.message, completed_at: now() }, (failErr) => {
            refreshBatch(job.batch_id, () => {});
            callback(failErr || requestErr);
          });
          return;
        }
        updateJob(job.id, { status: "saving", progress: 80 }, (savingErr) => {
          if (savingErr) {
            callback(savingErr);
            return;
          }
          saveGeneratedImage(job, response, (saveErr, saved) => {
            if (saveErr) {
              updateJob(job.id, { status: "failed", progress: 100, error_message: saveErr.message, completed_at: now() }, (failErr) => {
                refreshBatch(job.batch_id, () => {});
                callback(failErr || saveErr);
              });
              return;
            }
            const db = getDb();
            db.run(
              `INSERT INTO generated_images
              (batch_id, job_id, asset_type, ref_id, title, prompt, model, size, quality, file_path, response_json_path, status, progress, error_message, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [job.batch_id, job.id, job.asset_type, job.ref_id, job.title, job.prompt, job.model, job.size, job.quality, saved.imagePath, saved.responseJsonPath, "success", 100, "", now(), now()],
              (imageErr) => {
                if (imageErr) {
                  callback(imageErr);
                  return;
                }
                updateJob(job.id, { status: "success", progress: 100, image_path: saved.imagePath, response_json_path: saved.responseJsonPath, completed_at: now(), error_message: "" }, (successErr) => {
                  refreshBatch(job.batch_id, () => {});
                  callback(successErr, saved);
                });
              }
            );
          });
        });
      });
    });
  });
}

function scheduleBatch(batchId) {
  const db = getDb();
  const interval = Number(process.env.IMAGE_SUBMIT_INTERVAL_MS || 5000);
  db.all("SELECT * FROM image_generation_jobs WHERE batch_id = ? AND status = ? ORDER BY submit_order ASC", [batchId, "pending"], (jobErr, jobs) => {
    if (jobErr) {
      console.error(`读取图片生成队列失败：${jobErr.message}`);
      return;
    }
    jobs.forEach((job, index) => {
      setTimeout(() => {
        completeJob(job, (completeErr) => {
          if (completeErr) console.error(`图片任务 ${job.id} 失败：${completeErr.message}`);
        });
      }, index * interval);
    });
  });
}

function createBatch(params, callback) {
  const db = getDb();
  const jobs = params.jobs && params.jobs.length ? params.jobs : [params];
  const timestamp = now();
  db.run(
    `INSERT INTO image_generation_batches
    (batch_name, total_count, pending_count, submitted_count, generating_count, success_count, failed_count, progress, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [params.batchName || params.title || "图片生成批次", jobs.length, jobs.length, 0, 0, 0, 0, 0, "pending", timestamp, timestamp],
    function onBatchInserted(batchErr) {
      if (batchErr) {
        callback(batchErr);
        return;
      }
      const batchId = this.lastID;
      let index = 0;
      const insertNext = (insertErr) => {
        if (insertErr) {
          callback(insertErr);
          return;
        }
        if (index >= jobs.length) {
          refreshBatch(batchId, (refreshErr) => {
            if (refreshErr) {
              callback(refreshErr);
              return;
            }
            getBatchDetail(batchId, (detailErr, detail) => {
              if (!detailErr) scheduleBatch(batchId);
              callback(detailErr, detail);
            });
          });
          return;
        }
        const job = jobs[index];
        index += 1;
        db.run(
          `INSERT INTO image_generation_jobs
          (batch_id, asset_type, ref_id, title, prompt, model, size, quality, status, progress, submit_order, retry_count, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            batchId,
            job.assetType || job.asset_type || "character_avatar",
            job.refId || job.ref_id || null,
            job.title || `图片${index}`,
            job.prompt,
            job.model || "gpt-image-2",
            job.size || "1024x1024",
            job.quality || "auto",
            "pending",
            0,
            index,
            0,
            timestamp,
            timestamp
          ],
          insertNext
        );
      };
      insertNext();
    }
  );
}

function getBatchList(callback) {
  const db = getDb();
  db.all("SELECT * FROM image_generation_batches ORDER BY id DESC", callback);
}

function getBatchDetail(batchId, callback) {
  const db = getDb();
  db.get("SELECT * FROM image_generation_batches WHERE id = ?", [batchId], (batchErr, batch) => {
    if (batchErr || !batch) {
      callback(batchErr, batch);
      return;
    }
    db.all("SELECT * FROM image_generation_jobs WHERE batch_id = ? ORDER BY submit_order ASC", [batchId], (jobErr, jobs) => {
      callback(jobErr, { batch, jobs });
    });
  });
}

function getGeneratedImages(callback) {
  const db = getDb();
  db.all("SELECT * FROM generated_images ORDER BY id DESC", callback);
}

function getPageBackgrounds(callback) {
  const db = getDb();
  db.all(
    `SELECT title, image_path, response_json_path, updated_at
     FROM image_generation_jobs
     WHERE asset_type = ? AND status = ? AND image_path IS NOT NULL AND image_path != ''
     ORDER BY title ASC, updated_at DESC, id DESC`,
    ["page_background", "success"],
    callback
  );
}

function retryJob(jobId, callback) {
  const db = getDb();
  db.get("SELECT * FROM image_generation_jobs WHERE id = ?", [jobId], (jobErr, job) => {
    if (jobErr || !job) {
      callback(jobErr, job);
      return;
    }
    db.run(
      "UPDATE image_generation_jobs SET status = ?, progress = ?, error_message = ?, retry_count = retry_count + 1, updated_at = ? WHERE id = ?",
      ["pending", 0, "", now(), jobId],
      (updateErr) => {
        if (updateErr) {
          callback(updateErr);
          return;
        }
        refreshBatch(job.batch_id, () => {});
        db.get("SELECT * FROM image_generation_jobs WHERE id = ?", [jobId], (nextErr, nextJob) => {
          if (!nextErr && nextJob) {
            completeJob(nextJob, () => {});
          }
          callback(nextErr, nextJob);
        });
      }
    );
  });
}

function retryFailed(batchId, callback) {
  const db = getDb();
  db.all("SELECT id FROM image_generation_jobs WHERE batch_id = ? AND status = ?", [batchId, "failed"], (err, rows) => {
    if (err) {
      callback(err);
      return;
    }
    let index = 0;
    const next = (retryErr) => {
      if (retryErr) {
        callback(retryErr);
        return;
      }
      if (index >= rows.length) {
        getBatchDetail(batchId, callback);
        return;
      }
      const row = rows[index];
      index += 1;
      retryJob(row.id, next);
    };
    next();
  });
}

module.exports = {
  createBatch,
  getBatchList,
  getBatchDetail,
  getGeneratedImages,
  getPageBackgrounds,
  retryJob,
  retryFailed
};
