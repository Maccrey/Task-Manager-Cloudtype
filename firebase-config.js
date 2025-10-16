// Firebase Web SDK 설정 및 초기화
// 서버 없이 프론트엔드에서 직접 Firebase Realtime Database 사용

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDVW4gRCkZFqKx_MXXxBBN0AqQlFHjXkpg",
  authDomain: "task-manager-d7f91.firebaseapp.com",
  databaseURL: "https://task-manager-d7f91-default-rtdb.firebaseio.com",
  projectId: "task-manager-d7f91",
  storageBucket: "task-manager-d7f91.firebasestorage.app",
  messagingSenderId: "107033729788949223946",
  appId: "1:107033729788949223946:web:f3e8c4c6f8e6d7a8e3c4b5"
};

// Firebase 초기화
let app;
let database;
let isFirebaseInitialized = false;

function initializeFirebase() {
  if (isFirebaseInitialized) {
    return database;
  }

  try {
    // Firebase 앱 초기화
    app = firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    isFirebaseInitialized = true;

    console.log('✅ Firebase initialized successfully');
    console.log('📡 Connected to:', firebaseConfig.databaseURL);

    return database;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
}

// Firebase Database 참조 가져오기
function getDatabase() {
  if (!isFirebaseInitialized) {
    return initializeFirebase();
  }
  return database;
}

// 데이터 읽기 헬퍼 함수
async function firebaseGet(path) {
  const db = getDatabase();
  const snapshot = await db.ref(path).once('value');
  return snapshot.val();
}

// 데이터 쓰기 헬퍼 함수
async function firebaseSet(path, data) {
  const db = getDatabase();
  await db.ref(path).set(data);
}

// 데이터 업데이트 헬퍼 함수
async function firebaseUpdate(path, data) {
  const db = getDatabase();
  await db.ref(path).update(data);
}

// 데이터 삭제 헬퍼 함수
async function firebaseRemove(path) {
  const db = getDatabase();
  await db.ref(path).remove();
}

// 실시간 리스너 설정
function firebaseOnValue(path, callback) {
  const db = getDatabase();
  db.ref(path).on('value', (snapshot) => {
    callback(snapshot.val());
  });
}

// 리스너 제거
function firebaseOff(path, callback) {
  const db = getDatabase();
  if (callback) {
    db.ref(path).off('value', callback);
  } else {
    db.ref(path).off();
  }
}

// Books CRUD 함수들
const FirebaseBooks = {
  // 모든 책 가져오기
  async getAll() {
    const booksData = await firebaseGet('books');
    if (!booksData) return [];

    // Firebase 키를 id로 포함시켜서 반환 (누락된 id 방지)
    return Object.entries(booksData).map(([key, value]) => {
      // value에 id가 없거나 잘못된 경우 Firebase 키를 사용
      if (!value.id || value.id === 'undefined' || value.id === 'null') {
        return { ...value, id: key };
      }
      // id가 이미 있으면 그대로 사용 (하지만 키와 일치하는지 확인)
      if (value.id !== key) {
        console.warn(`⚠️ ID 불일치: Firebase 키=${key}, 객체 id=${value.id}`);
      }
      return value;
    });
  },

  // 책 ID로 가져오기
  async getById(id) {
    const book = await firebaseGet(`books/${id}`);
    return book;
  },

  // 새 책 추가
  async create(bookData) {
    const id = Date.now().toString();
    const newBook = { id, ...bookData };
    await firebaseSet(`books/${id}`, newBook);
    return newBook;
  },

  // 책 업데이트
  async update(id, bookData) {
    console.log(`📝 FirebaseBooks.update 호출: ID=${id}`);
    console.log(`📦 bookData:`, bookData);

    // bookData의 id와 파라미터 id 비교
    if (bookData.id && bookData.id !== id) {
      console.warn(`⚠️ ID 불일치 감지: 파라미터=${id}, bookData.id=${bookData.id}`);
      console.log(`🔄 파라미터 ID 사용: ${id}`);
    }

    // id를 제외한 데이터만 업데이트 (id 중복 방지)
    const { id: _, ...dataWithoutId } = bookData;
    // set()을 사용하여 전체 객체 교체 (update()는 부분 병합만 수행)
    const bookToSave = { id, ...dataWithoutId };

    console.log(`💾 Firebase에 저장: books/${id}`);
    await firebaseSet(`books/${id}`, bookToSave);

    console.log(`✅ 책 업데이트 완료: ID=${id}`);
    return bookToSave;
  },

  // 책 삭제
  async delete(id) {
    await firebaseRemove(`books/${id}`);
  },

  // 실시간 리스너
  onValue(callback) {
    firebaseOnValue('books', (data) => {
      if (!data) {
        callback([]);
        return;
      }

      // getAll()과 동일한 로직 사용
      const books = Object.entries(data).map(([key, value]) => {
        // value에 id가 없거나 잘못된 경우 Firebase 키를 사용
        if (!value.id || value.id === 'undefined' || value.id === 'null') {
          return { ...value, id: key };
        }
        // id가 이미 있으면 그대로 사용 (하지만 키와 일치하는지 확인)
        if (value.id !== key) {
          console.warn(`⚠️ ID 불일치: Firebase 키=${key}, 객체 id=${value.id}`);
        }
        return value;
      });

      callback(books);
    });
  },

  // 리스너 제거
  off(callback) {
    firebaseOff('books', callback);
  }
};

// Staff CRUD 함수들
const FirebaseStaff = {
  async getAll() {
    const staffData = await firebaseGet('staff');
    return staffData ? Object.values(staffData) : [];
  },

  async getById(id) {
    return await firebaseGet(`staff/${id}`);
  },

  async create(staffData) {
    const id = Date.now().toString();
    const newStaff = {
      id,
      name: staffData.name,
      role: staffData.role,
      createdAt: new Date().toISOString()
    };
    await firebaseSet(`staff/${id}`, newStaff);
    return newStaff;
  },

  async update(id, staffData) {
    const updateData = {
      ...staffData,
      updatedAt: new Date().toISOString()
    };
    await firebaseUpdate(`staff/${id}`, updateData);
    return { id, ...updateData };
  },

  async delete(id) {
    await firebaseRemove(`staff/${id}`);
  },

  onValue(callback) {
    firebaseOnValue('staff', (data) => {
      const staff = data ? Object.values(data) : [];
      callback(staff);
    });
  },

  off(callback) {
    firebaseOff('staff', callback);
  }
};

// Work Sessions CRUD 함수들
const FirebaseWorkSessions = {
  async getAll() {
    const sessions = await firebaseGet('workSessions');
    return sessions || {};
  },

  async start(taskId, worker) {
    const sessions = await this.getAll();

    // 같은 작업자의 기존 세션 종료
    for (const [id, session] of Object.entries(sessions)) {
      if (session.worker === worker) {
        await this.end(id);
      }
    }

    const newSession = {
      taskId,
      worker,
      startTime: new Date().toISOString(),
      isWorking: true
    };

    await firebaseSet(`workSessions/${taskId}`, newSession);
    return newSession;
  },

  async end(taskId, pagesWorked) {
    // 먼저 Firebase에서 세션 확인
    let session = await firebaseGet(`workSessions/${taskId}`);

    // 세션이 없으면 window.currentStoppedSession에서 정보 가져오기
    // (작업 중지 버튼을 눌렀을 때 이미 Firebase에서 제거되었을 수 있음)
    if (!session && window.currentStoppedSession) {
      console.log('Session already removed from Firebase, using stored session info');
      // 저장된 세션 정보로 completedSession 생성
      const completedSession = {
        id: Date.now().toString(),
        taskId: taskId,
        worker: window.currentStoppedSession.worker,
        startTime: window.currentStoppedSession.startTime || new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: window.currentStoppedSession.startTime
          ? new Date() - new Date(window.currentStoppedSession.startTime)
          : 0,
        pagesWorked: pagesWorked || 0,
        isWorking: false,
        taskTitle: window.currentStoppedSession.taskTitle || "Unknown",
        stage: window.currentStoppedSession.stage || "unknown"
      };

      // 히스토리에 추가
      await firebaseSet(`workSessionsHistory/${completedSession.id}`, completedSession);

      return completedSession;
    }

    if (!session) {
      console.warn('No work session found for task:', taskId);
      return null;
    }

    const completedSession = {
      id: Date.now().toString(),
      ...session,
      endTime: new Date().toISOString(),
      duration: new Date() - new Date(session.startTime),
      pagesWorked: pagesWorked || 0
    };

    // 히스토리에 추가
    await firebaseSet(`workSessionsHistory/${completedSession.id}`, completedSession);

    // 현재 세션 삭제 (아직 남아있다면)
    await firebaseRemove(`workSessions/${taskId}`);

    return completedSession;
  },

  async removeSession(taskId) {
    console.log(`🔥 removeSession called for task ${taskId}`);

    // 세션 정보를 미리 가져오기 (히스토리 저장용)
    const session = await firebaseGet(`workSessions/${taskId}`);

    // 세션이 존재하지 않으면 그냥 리턴
    if (!session) {
      console.log(`⚠️ No active session found for task ${taskId}`);
      return null;
    }

    console.log(`🗑️ Removing session from Firebase for task ${taskId}`, session);

    // 현재 세션만 삭제 (히스토리에 저장하지 않음 - 나중에 진행상황 제출할 때 저장)
    await firebaseRemove(`workSessions/${taskId}`);

    console.log(`✅ Session removed from Firebase for task ${taskId}`);

    return session;
  },

  onValue(callback) {
    firebaseOnValue('workSessions', callback);
  },

  off(callback) {
    firebaseOff('workSessions', callback);
  }
};

// Work Sessions History 함수들
const FirebaseWorkSessionsHistory = {
  async getAll() {
    const historyData = await firebaseGet('workSessionsHistory');
    if (!historyData) return [];
    return Object.entries(historyData).map(([id, session]) => ({ id, ...session }));
  },

  async create(session) {
    // 세션 ID가 있으면 사용하고, 없으면 생성
    const sessionId = session.id || Date.now().toString();
    const newSession = { ...session, id: sessionId };
    await firebaseSet(`workSessionsHistory/${sessionId}`, newSession);
    return newSession;
  },

  async update(id, session) {
    await firebaseUpdate(`workSessionsHistory/${id}`, session);
    return { id, ...session };
  },

  async delete(id) {
    await firebaseRemove(`workSessionsHistory/${id}`);
  },


  async clear() {
    await firebaseRemove('workSessionsHistory');
  },

  onValue(callback) {
    firebaseOnValue('workSessionsHistory', (data) => {
      const history = data ? Object.values(data) : [];
      callback(history);
    });
  },

  off(callback) {
    firebaseOff('workSessionsHistory', callback);
  }
};

// Attendance Memos 함수들
const FirebaseAttendanceMemos = {
  async getAll(user) {
    const memos = await firebaseGet(`attendanceMemos/${user}`);
    return memos || {};
  },

  async getByUser(user) {
    return await this.getAll(user);
  },

  async set(user, date, memo) {
    if (memo && memo.trim()) {
      await firebaseSet(`attendanceMemos/${user}/${date}`, memo.trim());
      return true;
    } else {
      await firebaseRemove(`attendanceMemos/${user}/${date}`);
      return true;
    }
  },

  async delete(user, date) {
    await firebaseRemove(`attendanceMemos/${user}/${date}`);
    return true;
  },

  onValue(user, callback) {
    firebaseOnValue(`attendanceMemos/${user}`, callback);
  },

  off(user, callback) {
    firebaseOff(`attendanceMemos/${user}`, callback);
  }
};

// Notes CRUD 함수들 (책의 노트)
const FirebaseNotes = {
  async getAll(bookId) {
    const notes = await firebaseGet(`books/${bookId}/notes`);
    return notes || [];
  },

  async create(bookId, noteData) {
    const book = await firebaseGet(`books/${bookId}`);
    if (!book) {
      throw new Error('Book not found');
    }

    const newNote = {
      noteId: Date.now().toString(),
      author: noteData.author,
      content: noteData.content,
      createdAt: new Date().toISOString()
    };

    const notes = book.notes || [];
    notes.push(newNote);

    await firebaseSet(`books/${bookId}/notes`, notes);
    return newNote;
  },

  async update(bookId, noteId, noteData) {
    const book = await firebaseGet(`books/${bookId}`);
    if (!book || !book.notes) {
      throw new Error('Book or notes not found');
    }

    const noteIndex = book.notes.findIndex(n => n.noteId === noteId);
    if (noteIndex === -1) {
      throw new Error('Note not found');
    }

    book.notes[noteIndex] = {
      ...book.notes[noteIndex],
      ...noteData,
      updatedAt: new Date().toISOString()
    };

    await firebaseSet(`books/${bookId}/notes`, book.notes);
    return book.notes[noteIndex];
  },

  async delete(bookId, noteId) {
    const book = await firebaseGet(`books/${bookId}`);
    if (!book || !book.notes) {
      throw new Error('Book or notes not found');
    }

    const notes = book.notes.filter(n => n.noteId !== noteId);
    await firebaseSet(`books/${bookId}/notes`, notes);
  }
};

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔥 Initializing Firebase...');
  initializeFirebase();
});

console.log('📦 Firebase config module loaded');
