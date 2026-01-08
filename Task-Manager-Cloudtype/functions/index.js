const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();

const app = express();

// 허용할 도메인
const allowedOrigins = [
  "https://mg1kg2i5183fc9ef.sel3.cloudtype.app",
  "https://task.maccrey.com",
];

// CORS 설정
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // 서버 간 호출 허용
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("CORS 정책에 의해 차단됨"), false);
      }
      return callback(null, true);
    },
  })
);

// Realtime DB 참조
const db = admin.database();

// FirebaseFetchAdapter 예제
class FirebaseFetchAdapter {
  static async fetch(resource) {
    switch (resource) {
      case "books": {
        const snapshot = await db.ref("/books").once("value");
        return snapshot.val() || {};
      }
      case "staff": {
        const snapshot = await db.ref("/staff").once("value");
        return snapshot.val() || {};
      }
      case "work-sessions": {
        const snapshot = await db.ref("/work-sessions").once("value");
        return snapshot.val() || {};
      }
      default:
        throw new Error(`Unknown resource: ${resource}`);
    }
  }
}

// API 라우터
app.get("/:resource", async (req, res) => {
  try {
    const data = await FirebaseFetchAdapter.fetch(req.params.resource);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Firebase Functions export
// exports.api = functions.region('asia-east1').https.onRequest(app);
exports.api = functions.https.onRequest(app);
