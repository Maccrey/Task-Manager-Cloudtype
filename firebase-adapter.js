// Firebase 어댑터: fetch API를 Firebase 호출로 변환
// 기존 코드를 최소한으로 수정하면서 Firebase 직접 연결

console.log("📦 Loading Firebase Adapter...");

// Firebase 사용 여부 플래그
const USE_FIREBASE_DIRECT = true;

// 기존 API URL 상수들 (Firebase 사용 시 무시됨)
// const LEGACY_API_URL = "https://port-0-task-manager-cloudtype-mg1kg2i5183fc9ef.sel3.cloudtype.app/books";
// const LEGACY_STAFF_API_URL = "https://port-0-task-manager-cloudtype-mg1kg2i5183fc9ef.sel3.cloudtype.app/staff";
const LEGACY_API_URL =
  "https://us-central1-task-manager-d7f91.cloudfunctions.net/api/books";
const LEGACY_STAFF_API_URL =
  "https://us-central1-task-manager-d7f91.cloudfunctions.net/api/staff";

// fetch를 Firebase 호출로 변환하는 어댑터
class FirebaseFetchAdapter {
  static async fetch(url, options = {}) {
    if (!USE_FIREBASE_DIRECT) {
      // Firebase 직접 연결 비활성화 시 원래 fetch 사용
      return fetch(url, options);
    }

    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : null;

    console.log(`🔥 Firebase Adapter: ${method} ${url}`);

    try {
      // URL 파싱
      const urlStr = typeof url === "string" ? url : url.toString();
      const urlParts = this.parseUrl(urlStr);

      // Firebase 호출로 변환
      const result = await this.routeToFirebase(urlParts, method, body);

      // fetch Response 형태로 변환
      return this.createResponse(result);
    } catch (error) {
      console.error("Firebase Adapter Error:", error);
      return this.createErrorResponse(error);
    }
  }

  static parseUrl(url) {
    // URL에서 경로 추출
    const urlObj = new URL(url, window.location.origin);
    const path = urlObj.pathname;
    const parts = path.split("/").filter((p) => p);

    return {
      path,
      parts,
      resource: parts[0], // books, staff, etc.
      id: parts[1],
      subResource: parts[2], // notes, etc.
      subId: parts[3],
    };
  }

  static async routeToFirebase(urlParts, method, body) {
    const { resource, id, subResource, subId } = urlParts;

    // Books API
    if (resource === "books") {
      if (subResource === "notes") {
        return await this.handleNotes(id, subId, method, body);
      }
      return await this.handleBooks(id, method, body);
    }

    // Staff API
    if (resource === "staff") {
      return await this.handleStaff(id, method, body);
    }

    // Work Sessions API
    if (resource === "work-sessions") {
      if (urlParts.path.includes("/end")) {
        return await this.handleWorkSessionEnd(body);
      }
      return await this.handleWorkSessions(id, method, body);
    }

    // Attendance Data API
    if (resource === "attendance-data") {
      return await this.handleAttendanceData(method, body);
    }

    // Attendance Memos API
    if (resource === "attendance-memos") {
      return await this.handleAttendanceMemos(id, subResource, method, body);
    }

    // API 경로
    if (resource === "api") {
      return await this.handleApiRoutes(urlParts, method, body);
    }

    throw new Error(`Unknown resource: ${resource}`);
  }

  // Books 핸들러
  static async handleBooks(id, method, body) {
    switch (method) {
      case "GET":
        if (id) {
          return await FirebaseBooks.getById(id);
        }
        return await FirebaseBooks.getAll();

      case "POST":
        return await FirebaseBooks.create(body);

      case "PUT":
        return await FirebaseBooks.update(id, body);

      case "DELETE":
        await FirebaseBooks.delete(id);
        return { success: true };

      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  // Staff 핸들러
  static async handleStaff(id, method, body) {
    switch (method) {
      case "GET":
        if (id) {
          return await FirebaseStaff.getById(id);
        }
        return await FirebaseStaff.getAll();

      case "POST":
        return await FirebaseStaff.create(body);

      case "PUT":
        return await FirebaseStaff.update(id, body);

      case "DELETE":
        await FirebaseStaff.delete(id);
        return { success: true };

      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  // Notes 핸들러
  static async handleNotes(bookId, noteId, method, body) {
    switch (method) {
      case "GET":
        return await FirebaseNotes.getAll(bookId);

      case "POST":
        return await FirebaseNotes.create(bookId, body);

      case "PUT":
        return await FirebaseNotes.update(bookId, noteId, body);

      case "DELETE":
        await FirebaseNotes.delete(bookId, noteId);
        return { success: true };

      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  // Work Sessions 핸들러
  static async handleWorkSessions(id, method, body) {
    switch (method) {
      case "GET":
        return await FirebaseWorkSessions.getAll();

      case "POST":
        return await FirebaseWorkSessions.start(body.taskId, body.worker);

      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  static async handleWorkSessionEnd(body) {
    return await FirebaseWorkSessions.end(body.taskId, body.pagesWorked);
  }

  // Attendance Data 핸들러
  static async handleAttendanceData(method, body) {
    switch (method) {
      case "GET":
        return await FirebaseWorkSessionsHistory.getAll();

      case "POST":
        // 히스토리 저장은 work session end에서 자동 처리됨
        return { success: true, message: "Handled by work session end" };

      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  // Attendance Memos 핸들러
  static async handleAttendanceMemos(user, date, method, body) {
    switch (method) {
      case "GET":
        return await FirebaseAttendanceMemos.getByUser(user);

      case "PUT":
        await FirebaseAttendanceMemos.set(user, date, body.memo);
        return {
          success: true,
          message: "Memo saved successfully",
          memo: body.memo,
        };

      case "DELETE":
        await FirebaseAttendanceMemos.delete(user, date);
        return { success: true, message: "Memo deleted successfully" };

      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  // API 경로 핸들러 (/api/*)
  static async handleApiRoutes(urlParts, method, body) {
    const resource = urlParts.parts[1]; // api 다음
    const action = urlParts.parts[2]; // info, backup, clear, etc.

    if (action === "info") {
      return await this.handleInfo(resource);
    }

    if (action === "backup") {
      return await this.handleBackup(resource);
    }

    if (action === "clear") {
      return await this.handleClear(resource, body);
    }

    if (action === "restore") {
      return await this.handleRestore(resource, body);
    }

    throw new Error(`Unknown API action: ${action}`);
  }

  static async handleInfo(resource) {
    let count = 0;
    switch (resource) {
      case "books":
        const books = await FirebaseBooks.getAll();
        count = books.length;
        break;
      case "staff":
        const staff = await FirebaseStaff.getAll();
        count = staff.length;
        break;
      case "work-sessions-history":
        const history = await FirebaseWorkSessionsHistory.getAll();
        count = history.length;
        break;
    }

    return {
      count,
      lastModified: new Date().toISOString(),
      source: "firebase",
    };
  }

  static async handleBackup(resource) {
    switch (resource) {
      case "books":
        return await FirebaseBooks.getAll();
      case "staff":
        return await FirebaseStaff.getAll();
      case "work-sessions-history":
        return await FirebaseWorkSessionsHistory.getAll();
    }
    throw new Error(`Unknown backup resource: ${resource}`);
  }

  static async handleClear(resource, body) {
    if (body.password !== "재활용") {
      throw new Error("Invalid password");
    }

    switch (resource) {
      case "books":
        await firebaseRemove("books");
        break;
      case "staff":
        await firebaseRemove("staff");
        break;
      case "work-sessions-history":
        await FirebaseWorkSessionsHistory.clear();
        break;
    }

    return { success: true, message: `${resource} cleared successfully` };
  }

  static async handleRestore(resource, data) {
    if (!Array.isArray(data)) {
      throw new Error("Restore data must be an array");
    }

    let count = 0;

    switch (resource) {
      case "books":
        // 기존 데이터 삭제
        await firebaseRemove("books");
        // 새 데이터 복원
        for (const book of data) {
          await FirebaseBooks.create(book);
          count++;
        }
        break;
      case "staff":
        // 기존 데이터 삭제
        await firebaseRemove("staff");
        // 새 데이터 복원
        for (const staffMember of data) {
          await FirebaseStaff.create(staffMember);
          count++;
        }
        break;
      case "work-sessions-history":
        // 기존 데이터 삭제
        await FirebaseWorkSessionsHistory.clear();
        // 새 데이터 복원
        for (const session of data) {
          await FirebaseWorkSessionsHistory.create(session);
          count++;
        }
        break;
      default:
        throw new Error(`Unknown restore resource: ${resource}`);
    }

    return {
      success: true,
      count,
      message: `${count} ${resource} items restored successfully`,
    };
  }

  // Response 객체 생성
  static createResponse(data) {
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => data,
      text: async () => JSON.stringify(data),
      blob: async () =>
        new Blob([JSON.stringify(data)], { type: "application/json" }),
    };
  }

  static createErrorResponse(error) {
    return {
      ok: false,
      status: error.status || 500,
      statusText: error.message || "Internal Server Error",
      json: async () => ({ error: error.message }),
      text: async () => JSON.stringify({ error: error.message }),
    };
  }
}

// 전역 fetch를 오버라이드
if (USE_FIREBASE_DIRECT) {
  const originalFetch = window.fetch;

  window.fetch = async function (url, options) {
    // Firebase 어댑터로 처리할 URL인지 확인
    const urlStr = typeof url === "string" ? url : url.toString();

    // API URL이면 Firebase 어댑터 사용
    if (
      urlStr.includes("/books") ||
      urlStr.includes("/staff") ||
      urlStr.includes("/work-sessions") ||
      urlStr.includes("/attendance") ||
      urlStr.includes("/api/")
    ) {
      return FirebaseFetchAdapter.fetch(url, options);
    }

    // 그 외는 원래 fetch 사용 (예: 외부 API)
    return originalFetch.call(this, url, options);
  };

  console.log("✅ Firebase Adapter: fetch override enabled");
}

console.log("✅ Firebase Adapter loaded");
