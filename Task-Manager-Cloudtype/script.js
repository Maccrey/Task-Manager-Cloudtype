document.addEventListener("DOMContentLoaded", () => {
  const analytics = window.FirebaseAnalytics;
  // 로그인 관련 변수
  let currentUser = null;
  const loginPage = document.getElementById("login-page");
  const mainDashboard = document.getElementById("main-dashboard");
  const loginForm = document.getElementById("login-form");
  const staffNameInput = document.getElementById("staff-name-login");
  const loginError = document.getElementById("login-error");
  const currentUserName = document.getElementById("current-user-name");
  const logoutBtn = document.getElementById("logout-btn");
  const symbolCheckerBtn = document.getElementById("symbol-checker-btn");
  const brailleTypingBtn = document.getElementById("braille-typing-btn");

  // Task filter elements
  const filterButtons = document.querySelectorAll(".filter-btn");
  let currentFilter = "all"; // Initialize with 'all' filter

  const isbnTitleInput = document.getElementById("isbn-title-input");
  const searchButton = document.getElementById("search-button");
  const addNewButton = document.getElementById("add-new-button");
  const completedBooksButton = document.getElementById(
    "completed-books-button"
  );
  const taskList = document.getElementById("task-list");
  const modal = document.getElementById("modal");
  const closeButton = document.querySelector(".close-button");
  const modalTitle = document.getElementById("modal-title");
  const bookInfoDiv = document.getElementById("book-info");
  const taskForm = document.getElementById("task-form");
  const totalPagesInput = document.getElementById("total-pages");
  const corrector1Input = document.getElementById("corrector1");
  const corrector2Input = document.getElementById("corrector2");
  const corrector3Input = document.getElementById("corrector3");
  const transcriberInput = document.getElementById("transcriber");
  const enableTranscriberCheckbox =
    document.getElementById("enable-transcriber");

  // Progress Update Modal Elements
  const progressUpdateModal = document.getElementById("progress-update-modal");
  const progressUpdateForm = document.getElementById("progress-update-form");
  const progressModalTitle = document.getElementById("progress-modal-title");
  const progressTaskInfo = document.getElementById("progress-task-info");
  const updatePageInput = document.getElementById("update-page-input");
  const updateDatetimeInput = document.getElementById("update-datetime-input");
  const progressModalCloseButton =
    progressUpdateModal.querySelector(".close-button");

  // Notes Modal Elements
  const notesModal = document.getElementById("notes-modal");
  const notesModalTitle = document.getElementById("notes-modal-title");
  const notesList = document.getElementById("notes-list");
  const noteForm = document.getElementById("note-form");
  const noteIdInput = document.getElementById("note-id");
  const noteAuthorInput = document.getElementById("note-author");
  const noteContentInput = document.getElementById("note-content");
  const notesModalCloseButton = notesModal.querySelector(".close-button");

  // Book Selection Modal Elements
  const bookSelectionModal = document.getElementById("book-selection-modal");
  const bookSelectionList = document.getElementById("book-selection-list");
  const bookSelectionCloseButton =
    bookSelectionModal.querySelector(".close-button");

  // Admin Panel Elements
  const adminModeButton = document.getElementById("admin-mode-button");
  const adminPanelModal = document.getElementById("admin-panel-modal");
  const adminPanelCloseButton = adminPanelModal.querySelector(".close-button");
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");
  const adminTasksTable = document.getElementById("admin-tasks-table");
  const adminTasksTbody = document.getElementById("admin-tasks-tbody");

  // Task Detail Modal Elements
  const taskDetailModal = document.getElementById("task-detail-modal");
  const taskDetailCloseButton = taskDetailModal.querySelector(".close-button");
  const detailTabButtons = document.querySelectorAll(".detail-tab-button");
  const detailTabContents = document.querySelectorAll(".detail-tab-content");
  const taskDetailForm = document.getElementById("task-detail-form");
  const saveTaskDetailBtn = document.getElementById("save-task-detail");
  const deleteTaskDetailBtn = document.getElementById("delete-task-detail");
  const cancelTaskDetailBtn = document.getElementById("cancel-task-detail");

  // Completed Books Modal Elements
  const completedBooksModal = document.getElementById("completed-books-modal");
  const completedBooksCloseButton =
    completedBooksModal.querySelector(".close-button");
  const completedBooksTbody = document.getElementById("completed-books-tbody");
  const completedSearch = document.getElementById("completed-search");
  const exportCompletedBtn = document.getElementById("export-completed-btn");
  const exportInProgressBtn = document.getElementById("export-in-progress-btn");
  const completedCount = document.getElementById("completed-count");

  // Password Modal Elements
  const passwordModal = document.getElementById("password-modal");
  const passwordForm = document.getElementById("password-form");
  const adminPasswordInput = document.getElementById("admin-password");
  const passwordCancelBtn = document.getElementById("password-cancel");
  const passwordModalCloseButton = passwordModal.querySelector(".close-button");

  // Assign Corrector Modal Elements
  const assignCorrectorModal = document.getElementById(
    "assign-corrector-modal"
  );
  const assignCorrectorForm = document.getElementById("assign-corrector-form");
  const assignModalTitle = document.getElementById("assign-modal-title");
  const assignTaskInfo = document.getElementById("assign-task-info");
  const assignCorrectorSelect = document.getElementById(
    "assign-corrector-select"
  );
  const assignCancelBtn = document.getElementById("assign-cancel-btn");
  const assignModalCloseButton =
    assignCorrectorModal.querySelector(".close-button");

  const apiKey =
    "e080d32c1a94808682a5c4fe268ba6f9e5aedf09c936f44ecb51272e59287233";

  // Firebase Adapter 라우팅 식별자
  // 주의: 이 값들은 더미가 아닙니다. firebase-adapter.js가 fetch() 호출을 Firebase로
  // 라우팅하기 위한 패턴 매칭 식별자입니다.
  // 새로운 코드에서는 이 상수들을 사용하지 말고 FirebaseBooks, FirebaseStaff 등을
  // 직접 사용하세요.
  const API_URL = "/books";
  const STAFF_API_URL = "/staff";
  const WORK_SESSIONS_API_URL = "/work-sessions";
  const ATTENDANCE_DATA_API_URL = "/attendance-data";
  const BASE_URL = "";

  // Firebase realtime listeners (replacing WebSocket)
  let firebaseListeners = {
    books: null,
    staff: null,
    workSessions: null,
  };

  let currentBook = null;
  let tasks = [];
  let staff = [];
  let currentTaskForUpdate = null;
  let currentTaskForNotes = null;
  let serverStatus = "unknown"; // 'online', 'offline', 'unknown'
  let isAdminMode = false;
  let currentEditingRow = null;
  let currentDetailTask = null;
  let currentWorkSessions = new Map(); // taskId -> { startTime, worker, isWorking }
  let workSessions = []; // All work sessions history
  let currentAssignTask = null; // Current task for corrector assignment
  let currentAssignStage = null; // Current stage for corrector assignment
  let isStartingNewSession = false; // Flag to prevent progress modal during session start
  let isProgressModalProtected = false; // 진행상황 모달 보호 플래그
  let workersDisplayInterval = null; // 현재 작업중인 사람들 표시 업데이트 타이머

  // Korean date parsing function
  function parseKoreanDate(dateStr) {
    if (!dateStr || typeof dateStr !== "string") {
      return null;
    }

    // If it's already a valid date object or ISO string, use it directly
    const directParse = new Date(dateStr);
    if (!isNaN(directParse.getTime())) {
      return directParse;
    }

    // Korean date format: "2025. 7. 10. 오후 5:45:00"
    const koreanDateRegex =
      /(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(오전|오후)\s*(\d{1,2}):(\d{2}):(\d{2})/;
    const match = dateStr.match(koreanDateRegex);

    if (match) {
      const [, year, month, day, ampm, hour, minute, second] = match;
      let hour24 = parseInt(hour, 10);

      // Convert to 24-hour format
      if (ampm === "오후" && hour24 !== 12) {
        hour24 += 12;
      } else if (ampm === "오전" && hour24 === 12) {
        hour24 = 0;
      }

      return new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1, // Month is 0-indexed
        parseInt(day, 10),
        hour24,
        parseInt(minute, 10),
        parseInt(second, 10)
      );
    }

    return null;
  }

  // Firebase 실시간 리스너 초기화
  function initializeFirebaseListeners() {
    try {
      console.log("Firebase 실시간 리스너 초기화 중...");

      // 기존 Books 리스너 제거 (중복 방지)
      if (firebaseListeners.books) {
        FirebaseBooks.off();
      }

      // Books 리스너
      firebaseListeners.books = FirebaseBooks.onValue((books) => {
        console.log("📚 Firebase Books 업데이트:", books.length);

        // 중복 ID 확인 및 제거
        const ids = books.map((b) => b.id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
          console.error("⚠️ 중복된 책 ID 발견!");
          const duplicates = ids.filter(
            (id, index) => ids.indexOf(id) !== index
          );
          console.error("중복 ID:", duplicates);

          // 중복 제거: 각 ID에 대해 첫 번째 항목만 유지
          const seen = new Set();
          books = books.filter((book) => {
            if (seen.has(book.id)) {
              console.warn(
                `🗑️ 중복 제거: ID=${book.id}, 제목=${book.book?.title}`
              );
              return false;
            }
            seen.add(book.id);
            return true;
          });
          console.log("✅ 중복 제거 후 책 수:", books.length);
        }

        tasks = books;
        renderTasks();
        if (typeof updateAdminTasksTable === "function") {
          updateAdminTasksTable();
        }
        if (typeof updateStatsTab === "function") {
          updateStatsTab();
        }
      });

      // 기존 Staff 리스너 제거 (중복 방지)
      if (firebaseListeners.staff) {
        FirebaseStaff.off();
      }

      // Staff 리스너
      firebaseListeners.staff = FirebaseStaff.onValue((staffList) => {
        console.log("👥 Firebase Staff 업데이트:", staffList.length);
        staff = staffList;
        updateStaffDropdowns();
        if (typeof displayStaffList === "function") {
          displayStaffList();
        }
      });

      // 기존 Work Sessions 리스너 제거 (중복 방지)
      if (firebaseListeners.workSessions) {
        FirebaseWorkSessions.off();
      }

      // Work Sessions 리스너
      firebaseListeners.workSessions = FirebaseWorkSessions.onValue(
        (sessions) => {
          console.log("🔔 Firebase Work Sessions 리스너 트리거됨");
          console.log("📊 Sessions 데이터:", sessions);

          if (sessions) {
            console.log(
              "✅ Firebase Work Sessions 업데이트:",
              Object.keys(sessions).length,
              "개 세션"
            );
            // sessions는 객체 형태이므로 배열로 변환
            workSessions = Object.values(sessions);

            // currentWorkSessions Map 업데이트
            const previousSize = currentWorkSessions.size;
            currentWorkSessions.clear();
            for (const [taskId, sessionData] of Object.entries(
              sessions || {}
            )) {
              if (sessionData && sessionData.isWorking) {
                currentWorkSessions.set(taskId, {
                  startTime: new Date(sessionData.startTime),
                  worker: sessionData.worker,
                  isWorking: sessionData.isWorking,
                  taskTitle: getTaskTitle(taskId),
                  stage: getCurrentStage(taskId),
                });
              }
            }
            console.log(
              `📈 currentWorkSessions 업데이트: ${previousSize} → ${currentWorkSessions.size}`
            );

            // UI 업데이트 - 작업 목록과 현재 작업자 표시 모두 업데이트
            const progressModal = document.getElementById(
              "progress-update-modal"
            );
            if (
              !isProgressModalProtected &&
              (!progressModal || progressModal.style.display !== "flex")
            ) {
              if (typeof renderTasks === "function") {
                console.log("🔄 renderTasks 호출");
                renderTasks();
              }
            }

            if (typeof updateCurrentWorkersDisplay === "function") {
              console.log("🔄 updateCurrentWorkersDisplay 호출");
              updateCurrentWorkersDisplay();
              // 실시간 업데이트 타이머 시작 (작업중인 세션이 있을 때만)
              startWorkersDisplayUpdate();
            }
          } else {
            console.log("⚠️ Sessions 데이터가 null 또는 비어있음");
            // sessions가 null이면 모든 세션이 제거된 것
            const previousSize = currentWorkSessions.size;
            currentWorkSessions.clear();
            console.log(`📉 currentWorkSessions 클리어됨: ${previousSize} → 0`);

            // UI 업데이트
            const progressModal = document.getElementById(
              "progress-update-modal"
            );
            if (
              !isProgressModalProtected &&
              (!progressModal || progressModal.style.display !== "flex")
            ) {
              if (typeof renderTasks === "function") {
                console.log("🔄 renderTasks 호출");
                renderTasks();
              }
            }

            if (typeof updateCurrentWorkersDisplay === "function") {
              console.log("🔄 updateCurrentWorkersDisplay 호출");
              updateCurrentWorkersDisplay();
              stopWorkersDisplayUpdate();
            }
          }
        }
      );

      console.log("Firebase 실시간 리스너 초기화 완료");
      updateStatusDisplay();
    } catch (error) {
      console.error("Firebase 리스너 초기화 오류:", error);
    }
  }

  // Firebase 리스너 정리 (페이지 종료 시)
  function cleanupFirebaseListeners() {
    if (firebaseListeners.books) {
      FirebaseBooks.off(firebaseListeners.books);
    }
    if (firebaseListeners.staff) {
      FirebaseStaff.off(firebaseListeners.staff);
    }
    if (firebaseListeners.workSessions) {
      FirebaseWorkSessions.off(firebaseListeners.workSessions);
    }
    // 실시간 업데이트 타이머 정리
    stopWorkersDisplayUpdate();
  }

  // Firebase 연결 상태 확인 (서버 연결 체크를 Firebase로 대체)
  async function checkServerConnection() {
    try {
      console.log("Checking Firebase connection...");

      // Firebase가 초기화되어 있는지 간단히 확인
      if (typeof firebase !== "undefined" && firebase.database) {
        serverStatus = "online";
        console.log("Firebase is available");
        return true;
      } else {
        serverStatus = "offline";
        console.log("Firebase is not available");
        return false;
      }
    } catch (error) {
      serverStatus = "offline";
      console.error("Firebase connection check failed:", error.message);
      return false;
    }
  }

  // 상태 표시 업데이트
  function updateStatusDisplay() {
    let statusText = "";
    let statusColor = "";

    switch (serverStatus) {
      case "online":
        statusText = "서버 연결됨";
        statusColor = "#4CAF50";
        break;
      case "offline":
        statusText = "서버 연결 실패";
        statusColor = "#f44336";
        break;
      default:
        statusText = "연결 상태 확인 중...";
        statusColor = "#607d8b";
    }

    // 헤더에 상태 표시 추가
    const header = document.querySelector("header h1");
    let statusSpan = document.querySelector(".server-status");
    if (!statusSpan) {
      statusSpan = document.createElement("span");
      statusSpan.className = "server-status";
      statusSpan.style.fontSize = "0.6em";
      statusSpan.style.marginLeft = "10px";
      statusSpan.style.padding = "2px 8px";
      statusSpan.style.borderRadius = "12px";
      statusSpan.style.backgroundColor = "rgba(255,255,255,0.2)";
      header.appendChild(statusSpan);
    }
    statusSpan.textContent = statusText;
    statusSpan.style.color = statusColor;
  }

  // 데이터 로드 함수 (Firebase 사용)
  async function loadTasks() {
    try {
      console.log("Loading tasks from Firebase...");
      updateStatusDisplay();

      const isFirebaseOnline = await checkServerConnection();

      if (isFirebaseOnline) {
        // Firebase에서 데이터 가져오기
        tasks = await FirebaseBooks.getAll();
        console.log(`Loaded ${tasks.length} tasks from Firebase`);

        // 데이터 구조 검증 및 복구
        tasks.forEach((task, index) => {
          if (!task.stages) {
            console.warn(
              `⚠️ Task ${index} (ID: ${task.id}) has no stages property! Initializing...`,
              task
            );
            task.stages = {
              correction1: { assignedTo: "", history: [], status: "pending" },
              correction2: {
                assignedTo: "",
                history: [],
                status: "not_applicable",
              },
              correction3: {
                assignedTo: "",
                history: [],
                status: "not_applicable",
              },
              finalCorrection: {
                assignedTo: "",
                history: [],
                status: "not_applicable",
              },
              transcription: {
                assignedTo: "",
                history: [],
                status: "not_applicable",
              },
            };
          }

          if (!task.currentStage) {
            console.warn(
              `⚠️ Task ${index} (ID: ${task.id}) has no currentStage property! Setting to correction1...`,
              task
            );
            task.currentStage = "correction1";
          }

          if (
            task.stages &&
            task.currentStage &&
            !task.stages[task.currentStage]
          ) {
            console.warn(
              `⚠️ Task ${index} (ID: ${task.id}) currentStage "${task.currentStage}" not found in stages! Initializing stage...`,
              {
                currentStage: task.currentStage,
                availableStages: Object.keys(task.stages),
              }
            );
            task.stages[task.currentStage] = {
              assignedTo: "",
              history: [],
              status: "pending",
            };
          }
        });

        // 현재 작업 세션도 Firebase에서 로드
        await loadCurrentWorkSessions();
      } else {
        throw new Error("Firebase is not available");
      }

      updateStatusDisplay();
      renderTasks();
    } catch (error) {
      console.error("Error in loadTasks:", error);
      serverStatus = "offline";
      tasks = [];

      updateStatusDisplay();
      renderTasks();
    }
  }

  // 작업 저장/업데이트 함수 (Firebase 사용)
  async function saveTask(task, isNewTask = false) {
    try {
      console.log(
        `${isNewTask ? "Creating" : "Updating"} task in Firebase:`,
        task.id
      );
      console.log("Task data being sent:", JSON.stringify(task, null, 2));

      let savedTask;
      if (isNewTask) {
        savedTask = await FirebaseBooks.create(task);
      } else {
        savedTask = await FirebaseBooks.update(task.id, task);
      }

      console.log("Task saved to Firebase:", savedTask);
      return savedTask;
    } catch (error) {
      console.error("Error saving task to Firebase:", error);
      console.error("Full error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      serverStatus = "offline";
      updateStatusDisplay();
      throw error;
    }
  }

  // 작업 삭제 함수 (Firebase 사용)
  async function deleteTask(taskId) {
    try {
      await FirebaseBooks.delete(taskId);
      console.log("Task deleted from Firebase:", taskId);

      // 로컬 배열에서도 삭제
      const index = tasks.findIndex((t) => t.id === taskId);
      if (index !== -1) {
        tasks.splice(index, 1);
        console.log("Task deleted locally");
      }

      renderTasks();
    } catch (error) {
      console.error("Error deleting task from Firebase:", error);
      serverStatus = "offline";
      updateStatusDisplay();
      alert("작업 삭제에 실패했습니다: " + error.message);
    }
  }

  // HTML 태그 제거 함수
  function stripHtmlTags(html) {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  // Staff management functions (Firebase 사용)
  async function loadStaff() {
    try {
      staff = await FirebaseStaff.getAll();
      updateStaffDropdowns();
      updateAssignCorrectorDropdownIfOpen(); // Update assign corrector dropdown if modal is open
      console.log(`Loaded ${staff.length} staff members from Firebase`);
    } catch (error) {
      console.error("Error loading staff from Firebase:", error);
      staff = [];
    }
  }

  async function addStaff(name, role) {
    try {
      const newStaff = await FirebaseStaff.create({ name, role });
      staff.push(newStaff);
      updateStaffDropdowns();
      updateAssignCorrectorDropdownIfOpen(); // Update assign corrector dropdown if modal is open

      // 항상 직원 리스트 렌더링
      renderStaffList();
      // 직원 탭 강제 유지
      switchTab("staff");
      return newStaff;
    } catch (error) {
      console.error("Error adding staff to Firebase:", error);
      throw error;
    }
  }

  async function deleteStaff(staffId) {
    try {
      await FirebaseStaff.delete(staffId);
      staff = staff.filter((s) => s.id !== staffId);
      updateStaffDropdowns();
      updateAssignCorrectorDropdownIfOpen(); // Update assign corrector dropdown if modal is open

      // 항상 직원 리스트 렌더링
      renderStaffList();
      // 직원 탭 강제 유지
      switchTab("staff");
    } catch (error) {
      console.error("Error deleting staff from Firebase:", error);
      throw error;
    }
  }

  function updateStaffDropdowns() {
    // Get all dropdown elements
    const dropdowns = [
      document.getElementById("corrector1"),
      document.getElementById("corrector2"),
      document.getElementById("corrector3"),
      document.getElementById("final-corrector-assigned"),
      document.getElementById("transcriber"),
      document.getElementById("corrector1-assigned"),
      document.getElementById("corrector2-assigned"),
      document.getElementById("corrector3-assigned"),
      document.getElementById("transcriber-assigned"),
    ];

    dropdowns.forEach((dropdown) => {
      if (dropdown) {
        // Save current value
        const currentValue = dropdown.value;

        // Clear existing options except first one
        dropdown.innerHTML = '<option value="">담당자 선택</option>';

        // Add staff options based on dropdown type
        const isTranscriber = dropdown.id.includes("transcriber");
        const filteredStaff = staff.filter((s) => {
          if (isTranscriber) {
            return (
              s.role === "transcriber" ||
              s.role === "both" ||
              s.role === "admin"
            );
          } else {
            return (
              s.role === "corrector" || s.role === "both" || s.role === "admin"
            );
          }
        });

        filteredStaff.forEach((s) => {
          const option = document.createElement("option");
          option.value = s.name;
          option.textContent = s.name;
          dropdown.appendChild(option);
        });

        // Restore previous value if it still exists
        if (
          currentValue &&
          Array.from(dropdown.options).some((opt) => opt.value === currentValue)
        ) {
          dropdown.value = currentValue;
        }
      }
    });
  }

  function renderStaffList() {
    const staffTbody = document.getElementById("staff-tbody");
    if (!staffTbody) return;

    staffTbody.innerHTML = "";

    if (staff.length === 0) {
      staffTbody.innerHTML =
        '<tr><td colspan="5" style="text-align: center; color: #666; padding: 20px;">등록된 직원이 없습니다.</td></tr>';
      return;
    }

    staff.forEach((s) => {
      const row = document.createElement("tr");

      const roleText =
        {
          corrector: "교정자",
          transcriber: "점역자",
          both: "교정자+점역자",
          admin: "관리자",
        }[s.role] || s.role;

      const createdDate = new Date(s.createdAt).toLocaleDateString("ko-KR");

      row.innerHTML = `
        <td>${s.name}</td>
        <td>${roleText}</td>
        <td>${createdDate}</td>
        <td>
          <button class="action-btn edit-btn" onclick="handleEditStaff('${s.id}')">수정</button>
          <button class="action-btn delete-btn" onclick="handleDeleteStaff('${s.id}')">삭제</button>
        </td>
      `;
      staffTbody.appendChild(row);
    });
  }

  // Debug function to test API connectivity
  window.testAPIConnection = async function () {
    console.log("=== API Connection Test ===");
    console.log("API_URL:", API_URL);

    try {
      // Test GET request
      console.log("Testing GET request...");
      const getResponse = await fetch(API_URL);
      console.log("GET Response:", getResponse.status, getResponse.statusText);

      if (getResponse.ok) {
        const data = await getResponse.json();
        console.log("GET Data length:", data.length);

        if (data.length > 0) {
          const testTask = data[0];
          console.log("Testing PUT request with task:", testTask.id);

          // Test PUT request
          const putResponse = await fetch(`${API_URL}/${testTask.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...testTask,
              testField: `test-${Date.now()}`,
            }),
          });

          console.log(
            "PUT Response:",
            putResponse.status,
            putResponse.statusText
          );

          if (putResponse.ok) {
            const putData = await putResponse.json();
            console.log("PUT Success, updated task:", putData.id);
          } else {
            const errorText = await putResponse.text();
            console.error("PUT Error:", errorText);
          }
        }
      }
    } catch (error) {
      console.error("API Test Error:", error);
    }

    console.log("=== End API Test ===");
  };

  // 초기 로드는 로그인 후에만 실행

  // 점역자 체크박스 이벤트
  enableTranscriberCheckbox.addEventListener("change", () => {
    transcriberInput.disabled = !enableTranscriberCheckbox.checked;
    if (transcriberInput.disabled) {
      transcriberInput.value = "";
    }
  });

  // 모달 열기
  function openModal(title = "신규 도서 등록", book = null) {
    modalTitle.textContent = title;
    bookInfoDiv.innerHTML = "";
    currentBook = book;

    if (book) {
      bookInfoDiv.innerHTML = `
                <p><strong>제목:</strong> ${stripHtmlTags(book.title)}</p>
                <p><strong>저자:</strong> ${
                  stripHtmlTags(book.author) || "정보 없음"
                }</p>
                <p><strong>출판사:</strong> ${
                  stripHtmlTags(book.publisher) || "정보 없음"
                }</p>
                <p><strong>ISBN:</strong> ${book.isbn || "정보 없음"}</p>
            `;
    } else {
      bookInfoDiv.innerHTML = `
                <p>검색된 도서 정보가 없습니다. 수동으로 입력해주세요.</p>
                <label for="manual-title">제목:</label>
                <input type="text" id="manual-title" required>
                <label for="manual-author">저자:</label>
                <input type="text" id="manual-author">
                <label for="manual-publisher">출판사:</label>
                <input type="text" id="manual-publisher">
                <label for="manual-isbn">ISBN:</label>
                <input type="text" id="manual-isbn">
            `;
    }

    taskForm.reset();
    enableTranscriberCheckbox.checked = true;
    transcriberInput.disabled = false;
    taskForm.style.display = "block";
    modal.style.display = "flex";
  }

  // 모달 닫기
  function closeModal() {
    modal.style.display = "none";
    taskForm.style.display = "block";
  }

  // 도서 검색
  async function searchBooks(query) {
    if (apiKey === "YOUR_API_KEY") {
      alert("국립중앙도서관 API 키를 script.js 파일에 입력해주세요.");
      return;
    }

    const url = `https://www.nl.go.kr/NL/search/openApi/search.do?key=${apiKey}&apiType=json&srchTarget=total&kwd=${encodeURIComponent(
      query
    )}`;

    try {
      console.log("Searching books:", query);
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      const resultCount = Array.isArray(data.result) ? data.result.length : 0;
      analytics?.logEvent?.("book_search", {
        query,
        result_count: resultCount,
      });

      if (data.result && data.result.length > 0) {
        if (data.result.length === 1) {
          // 검색 결과가 1개일 때는 기존과 같이 바로 모달 열기
          const book = data.result[0];
          const bookInfo = {
            title: book.titleInfo || "",
            author: book.authorInfo || "",
            publisher: book.pubInfo || "",
            isbn: book.isbn || "",
            totalPages: null,
          };
          openModal("도서 정보 확인 및 등록", bookInfo);
        } else {
          // 검색 결과가 여러 개일 때는 선택 모달 표시
          showBookSelectionModal(data.result);
        }
      } else {
        alert("검색 결과가 없습니다.");
        openModal(); // 수동 입력 모달 열기
      }
    } catch (error) {
      console.error("Error fetching book data:", error);
      alert(`책 정보를 가져오는 데 실패했습니다: ${error.message}`);
      analytics?.logEvent?.("book_search_error", {
        query,
        message: error.message,
      });
      openModal(); // 수동 입력 모달 열기
    }
  }

  // 이벤트 리스너들
  searchButton.addEventListener("click", () => {
    const query = isbnTitleInput.value.trim();
    if (query) {
      searchBooks(query);
    } else {
      alert("ISBN 또는 책 제목을 입력해주세요.");
    }
  });

  // Enter 키로 검색
  isbnTitleInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchButton.click();
    }
  });

  addNewButton.addEventListener("click", () => {
    openModal();
    analytics?.logEvent?.("task_modal_opened", {
      mode: currentBook ? "edit" : "create",
    });
  });

  completedBooksButton.addEventListener("click", () => {
    openCompletedBooksModal();
    analytics?.logEvent?.("completed_books_viewed", {});
  });

  closeButton.addEventListener("click", closeModal);

  // 모달 외부 클릭시 닫기
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }

    if (event.target === bookSelectionModal) {
      closeBookSelectionModal();
    }
    if (event.target === adminPanelModal && !isStaffOperationInProgress) {
      closeAdminPanel();
    }
    if (event.target === document.getElementById("attendance-only-modal")) {
      document.getElementById("attendance-only-modal").style.display = "none";
    }
  });

  // 필터 버튼 이벤트 리스너
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      renderTasks();
      analytics?.logEvent?.("task_filter_applied", {
        filter: currentFilter,
      });
    });
  });

  // 작업 등록 폼 제출
  taskForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const newBook = currentBook || {
        title: document.getElementById("manual-title")?.value.trim() || "",
        author: document.getElementById("manual-author")?.value.trim() || "",
        publisher:
          document.getElementById("manual-publisher")?.value.trim() || "",
        isbn: document.getElementById("manual-isbn")?.value.trim() || "",
      };

      if (!newBook.title) {
        alert("책 제목은 필수입니다.");
        return;
      }

      const totalPages = parseInt(totalPagesInput.value);
      if (isNaN(totalPages) || totalPages <= 0) {
        alert("올바른 페이지 수를 입력해주세요.");
        return;
      }

      const corrector1 = corrector1Input.value.trim();
      if (!corrector1) {
        alert("1차 교정자는 필수입니다.");
        return;
      }

      const corrector2 = corrector2Input.value.trim();
      const corrector3 = corrector3Input.value.trim();
      const transcriber = transcriberInput.value.trim();
      const isTranscriberEnabled = enableTranscriberCheckbox.checked;

      const newTask = {
        id: Date.now().toString(), // ID를 문자열로 생성
        book: newBook,
        totalPages: totalPages,
        stages: {
          correction1: {
            assignedTo: corrector1,
            history: [],
            status: "pending",
          },
          correction2: {
            assignedTo: corrector2,
            history: [],
            status: "pending",
          },
          correction3: {
            assignedTo: corrector3,
            history: [],
            status: "pending",
          },
          finalCorrection: {
            assignedTo: "",
            history: [],
            status: isTranscriberEnabled ? "pending" : "not_applicable",
          },
          transcription: {
            assignedTo: transcriber,
            history: [],
            status:
              isTranscriberEnabled && transcriber
                ? "pending"
                : "not_applicable",
          },
        },
        currentStage: "correction1",
      };

      console.log("Creating new task:", newTask);

      const savedTask = await saveTask(newTask, true);
      analytics?.logEvent?.("task_created", {
        task_id: savedTask?.id || newTask.id,
        title: stripHtmlTags(savedTask?.book?.title || newBook.title),
        total_pages: totalPages,
        corrector1,
        created_by: currentUser || "unknown",
      });

      // 데이터 목록을 다시 로드하여 화면을 갱신
      await loadTasks();

      closeModal();

      alert("새 작업이 등록되었습니다.");
    } catch (error) {
      console.error("Error adding task:", error);
      alert(`작업을 추가하는 데 실패했습니다: ${error.message}`);
      analytics?.logEvent?.("task_create_error", {
        message: error.message,
      });
    }
  });

  // 작업 목록 렌더링
  function renderTasks() {
    taskList.innerHTML = "";

    if (!Array.isArray(tasks)) {
      console.warn("tasks is not an array, initializing to empty array");
      tasks = [];
    }

    if (serverStatus === "offline") {
      taskList.innerHTML =
        '<div style="display: flex; justify-content: center; align-items: center; min-height: 300px; padding: 40px;">...</div>';
      return;
    }

    let filteredTasks = [];
    if (currentFilter === "all") {
      filteredTasks = tasks.filter(
        (task) => task && task.currentStage !== "completed"
      );
    } else {
      filteredTasks = tasks.filter(
        (task) => task && task.currentStage === currentFilter
      );
    }

    if (filteredTasks.length === 0) {
      taskList.innerHTML =
        '<div style="display: flex; justify-content: center; align-items: center; min-height: 300px; padding: 40px;">...</div>';
      return;
    }

    filteredTasks.sort((a, b) => {
      const aAssignedTo = a.stages[a.currentStage]?.assignedTo;
      const bAssignedTo = b.stages[b.currentStage]?.assignedTo;
      const aIsCurrentUser = aAssignedTo === currentUser;
      const bIsCurrentUser = bAssignedTo === currentUser;

      if (aIsCurrentUser && !bIsCurrentUser) return -1;
      if (!aIsCurrentUser && bIsCurrentUser) return 1;

      const aHasAssignee = !!aAssignedTo;
      const bHasAssignee = !!bAssignedTo;

      if (aHasAssignee && !bHasAssignee) return -1;
      if (!aHasAssignee && bHasAssignee) return 1;
      return 0;
    });

    filteredTasks.forEach((task) => {
      const taskItem = document.createElement("div");
      taskItem.classList.add("task-item");

      let currentProgress = 0;
      let currentStageName = "";
      let currentPageForDisplay = 0;

      if (task.currentStage && task.currentStage !== "completed") {
        const stage = task.stages[task.currentStage];
        if (stage && stage.history && stage.history.length > 0) {
          currentPageForDisplay =
            stage.history[stage.history.length - 1].endPage;
          currentProgress = (currentPageForDisplay / task.totalPages) * 100;
        }
      }

      switch (task.currentStage) {
        case "correction1":
          currentStageName = "1차 교정";
          break;
        case "correction2":
          currentStageName = "2차 교정";
          break;
        case "correction3":
          currentStageName = "3차 교정";
          break;
        case "finalCorrection":
          currentStageName = "최종 검수";
          break;
        case "transcription":
          currentStageName = "점역";
          break;
        case "completed":
          currentStageName = "모든 작업 완료";
          currentProgress = 100;
          currentPageForDisplay = task.totalPages;
          break;
        default:
          currentStageName = "알 수 없음";
      }

      const assignedTo = task.stages[task.currentStage]?.assignedTo || "미정";
      const showAssignButton = task.currentStage !== "completed" && !assignedTo;
      const noteCount = task.notes ? task.notes.length : 0;
      const isCurrentUserAssigned = currentUser === assignedTo;

      let workSessionButtonHtml = "";
      if (assignedTo !== "미정" && task.currentStage !== "completed") {
        const isWorking = currentWorkSessions.has(task.id);
        const buttonClass = `work-session-button ${
          isWorking ? "stop" : "start"
        } ${!isCurrentUserAssigned ? "disabled" : ""}`;
        const buttonText = isWorking ? "작업중지" : "작업시작";
        const disabledAttr = !isCurrentUserAssigned ? "disabled" : "";
        workSessionButtonHtml = `<button data-id="${task.id}" class="${buttonClass}" data-worker="${assignedTo}" ${disabledAttr}>${buttonText}</button>`;
      }

      const isButtonDisabled = !isCurrentUserAssigned && assignedTo !== "미정";
      const buttonDisabledAttr = isButtonDisabled ? "disabled" : "";
      const buttonDisabledClass = isButtonDisabled ? "disabled" : "";

      let assigneeText = `${currentStageName} 담당자: ${assignedTo}`;
      if (task.currentStage === "correction2" && assignedTo === "미정") {
        assigneeText = `2차 교정 담당자: 미정`;
      }

      taskItem.innerHTML = `
        <h3 class="task-title" data-id="${
          task.id
        }" title="클릭하여 작업 히스토리 보기">${stripHtmlTags(
        task.book.title
      )}</h3>
        <p><strong>ISBN:</strong> ${task.book.isbn || "정보 없음"}</p>
        <p><strong>총 페이지:</strong> ${task.totalPages}</p>
        <p><strong>현재 단계:</strong> ${currentStageName}</p>
        <p><strong>진행률:</strong> ${currentProgress.toFixed(
          1
        )}% (${currentPageForDisplay}/${task.totalPages} 페이지)</p>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${Math.min(
            currentProgress,
            100
          )}%;"></div>
        </div>
        <p><strong>${assigneeText}</strong>
          ${
            showAssignButton
              ? `<button class="assign-corrector-button" data-id="${task.id}" data-stage="${task.currentStage}">지정</button>`
              : ""
          }
        </p>
        <div class="task-buttons">
          ${
            task.currentStage !== "completed"
              ? `<button data-id="${task.id}" class="update-progress-button ${buttonDisabledClass}" ${buttonDisabledAttr}>진행 상황 업데이트</button>`
              : ""
          }
          <button data-id="${
            task.id
          }" class="delete-task-button ${buttonDisabledClass}" ${buttonDisabledAttr}>삭제</button>
          <button data-id="${task.id}" class="notes-button ${
        noteCount === 0 ? "inactive" : ""
      }">특이사항 <span class="note-count">${noteCount}</span></button>
          ${workSessionButtonHtml}
        </div>
      `;
      taskList.appendChild(taskItem);
    });
  }

  // 이벤트 위임을 사용하여 taskList에 대한 클릭 이벤트 처리
  taskList.addEventListener("click", (event) => {
    const target = event.target;
    const taskId = target.dataset.id;
    const task = tasks.find((t) => t.id === taskId);

    // 작업 세션 버튼 클릭 시 상세 로그
    if (target.classList.contains("work-session-button") && task) {
      console.log(`🔍 작업 세션 버튼 클릭 - Task ID: ${taskId}`);
      console.log(`📄 찾은 Task:`, task);
    }

    if (target.classList.contains("update-progress-button")) {
      if (task) {
        openProgressUpdateModal(task);
      }
    } else if (target.classList.contains("delete-task-button")) {
      const password = prompt("작업을 삭제하려면 비밀번호를 입력하세요:");
      if (password === "maccreytask") {
        if (
          task &&
          confirm(
            `'${stripHtmlTags(task.book.title)}' 작업을 삭제하시겠습니까?`
          )
        ) {
          deleteTask(taskId);
        }
      } else if (password !== null) {
        alert("비밀번호가 올바르지 않습니다.");
      }
    } else if (target.classList.contains("task-title")) {
      if (task) {
        showTaskHistory(task);
      }
    } else if (target.classList.contains("assign-corrector-button")) {
      const stageKey = target.dataset.stage;
      if (task) {
        assignCorrectorFromCard(task, stageKey);
      }
    } else if (target.closest(".notes-button")) {
      if (task) {
        openNotesModal(task);
      }
    } else if (target.classList.contains("work-session-button")) {
      if (target.classList.contains("disabled")) {
        alert("해당 작업자가 아닙니다.");
        return;
      }
      const worker = target.dataset.worker;
      if (target.classList.contains("start")) {
        startWorkSession(task, worker);
      } else {
        stopWorkSession(task, worker, true); // 명시적으로 진행상황 모달 표시
      }
    }
  });

  // 담당자 지정 모달 열기
  function assignCorrectorFromCard(task, stageKey) {
    currentAssignTask = task;
    currentAssignStage = stageKey;

    const stageNames = {
      correction1: "1차 교정",
      correction2: "2차 교정",
      correction3: "3차 교정",
      transcription: "점역",
    };

    const stageName = stageNames[stageKey] || stageKey;

    assignModalTitle.textContent = "담당자 지정";
    assignTaskInfo.innerHTML = `
      <strong>도서:</strong> ${stripHtmlTags(task.book.title)}<br>
      <strong>단계:</strong> ${stageName}
    `;

    // 드롭다운에 최신 직원 목록 채우기 (모달 열 때마다 최신 데이터 사용)
    populateAssignCorrectorDropdown(stageKey);

    assignCorrectorModal.style.display = "flex";
  }

  // 담당자 지정 드롭다운 채우기
  function populateAssignCorrectorDropdown(stageKey) {
    assignCorrectorSelect.innerHTML =
      '<option value="">담당자를 선택해주세요</option>';

    if (staff.length === 0) {
      assignCorrectorSelect.innerHTML =
        '<option value="">등록된 직원이 없습니다</option>';
      return;
    }

    const isTranscriber = stageKey === "transcription";
    const filteredStaff = staff.filter((s) => {
      if (isTranscriber) {
        return (
          s.role === "transcriber" || s.role === "both" || s.role === "admin"
        );
      } else {
        return (
          s.role === "corrector" || s.role === "both" || s.role === "admin"
        );
      }
    });

    if (filteredStaff.length === 0) {
      const roleText = isTranscriber ? "점역자" : "교정자";
      assignCorrectorSelect.innerHTML = `<option value="">등록된 ${roleText}가 없습니다</option>`;
      return;
    }

    filteredStaff.forEach((s) => {
      const option = document.createElement("option");
      option.value = s.name;
      option.textContent = s.name;
      assignCorrectorSelect.appendChild(option);
    });
  }

  // 담당자 지정 모달 닫기
  function closeAssignCorrectorModal() {
    assignCorrectorModal.style.display = "none";
    currentAssignTask = null;
    currentAssignStage = null;
    assignCorrectorSelect.value = "";
  }

  // 담당자 지정 모달이 열려있다면 드롭다운 업데이트
  function updateAssignCorrectorDropdownIfOpen() {
    // Check if assign corrector modal is currently open
    if (
      assignCorrectorModal &&
      assignCorrectorModal.style.display === "flex" &&
      currentAssignStage
    ) {
      // Save current selection
      const currentValue = assignCorrectorSelect.value;

      // Repopulate dropdown with latest staff data
      populateAssignCorrectorDropdown(currentAssignStage);

      // Restore selection if it's still valid
      if (currentValue) {
        const options = Array.from(assignCorrectorSelect.options);
        if (options.some((opt) => opt.value === currentValue)) {
          assignCorrectorSelect.value = currentValue;
        }
      }
    }
  }

  // 담당자 지정 처리
  async function handleAssignCorrectorSubmit(e) {
    e.preventDefault();

    const selectedWorker = assignCorrectorSelect.value;
    if (!selectedWorker) {
      alert("담당자를 선택해주세요.");
      return;
    }

    if (!currentAssignTask || !currentAssignStage) {
      alert("작업 정보를 찾을 수 없습니다.");
      return;
    }

    const originalAssignedTo =
      currentAssignTask.stages[currentAssignStage].assignedTo;
    currentAssignTask.stages[currentAssignStage].assignedTo = selectedWorker;

    try {
      await saveTask(currentAssignTask);
      renderTasks();

      // If this was triggered from progress update, continue with progress modal
      if (window.pendingProgressUpdateTask) {
        const pendingTask = window.pendingProgressUpdateTask;
        window.pendingProgressUpdateTask = null;
        closeAssignCorrectorModal();
        setTimeout(() => {
          openProgressUpdateModal(pendingTask);
        }, 100);
      } else {
        closeAssignCorrectorModal();
        alert("담당자가 지정되었습니다.");
      }
    } catch (error) {
      console.error("Error assigning corrector:", error);
      currentAssignTask.stages[currentAssignStage].assignedTo =
        originalAssignedTo;
      alert(`담당자 지정에 실패했습니다: ${error.message}`);
    }
  }

  // 진행 상황 업데이트 모달 열기
  function openProgressUpdateModal(task) {
    currentTaskForUpdate = task;
    document.getElementById("progress-task-id").value = task.id; // ID를 숨겨진 필드에 저장
    const stageKey = task.currentStage;

    if (!stageKey || stageKey === "completed") {
      alert("이미 완료된 작업입니다.");
      return;
    }

    const stageNames = {
      correction1: "1차 교정",
      correction2: "2차 교정",
      correction3: "3차 교정",
      finalCorrection: "최종 검수",
      transcription: "점역",
    };

    const stageName = stageNames[stageKey] || stageKey;
    const stage = task.stages && task.stages[stageKey];

    if (!stage) {
      console.error(
        `❌ openProgressUpdateModal: Stage not found - currentStage=${stageKey}`,
        task
      );
      alert(
        `작업 단계 정보를 찾을 수 없습니다. (단계: ${stageKey})\n\n페이지를 새로고침해주세요.`
      );
      return;
    }

    const assignedTo = stage.assignedTo;

    if (!assignedTo) {
      // Store the task to continue with progress update after assignment
      window.pendingProgressUpdateTask = task;
      assignCorrectorFromCard(task, stageKey);
      return;
    }

    const lastCompletedPage =
      stage.history && stage.history.length > 0
        ? stage.history[stage.history.length - 1].endPage
        : 0;

    progressModalTitle.textContent = `${stripHtmlTags(
      task.book.title
    )} - 진행 상황 업데이트`;
    progressTaskInfo.innerHTML = `
            <strong>현재 단계:</strong> ${stageName}<br>
            <strong>담당자:</strong> ${assignedTo}<br>
            <strong>총 페이지:</strong> ${task.totalPages}<br>
            <strong>현재 완료 페이지:</strong> ${lastCompletedPage}
        `;

    updatePageInput.value = "";
    updateDatetimeInput.value = "";
    updatePageInput.max = task.totalPages;
    updatePageInput.min = lastCompletedPage + 1;

    // 현재 시간을 기본값으로 설정
    const now = new Date();
    const localISOTime =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0") +
      "T" +
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0");
    updateDatetimeInput.value = localISOTime;

    progressUpdateModal.style.display = "flex";

    // Clear previous error message
    const errorEl = document.getElementById("progress-error-message");
    if (errorEl) {
      errorEl.textContent = "";
    }
  }

  // 진행 상황 업데이트 모달 닫기
  function closeProgressUpdateModal() {
    progressUpdateModal.style.display = "none";
    currentTaskForUpdate = null;

    // 모달 보호 플래그 해제
    isProgressModalProtected = false;

    // 모달이 닫힐 때 UI 업데이트
    renderTasks();
  }

  progressModalCloseButton.addEventListener("click", () => {
    alert(
      "경고 : 완료페이지를 넣고 저장하지 않으면 업무시간이 저장되지 않습니다."
    );
  });

  // 진행 상황 업데이트 폼 제출
  progressUpdateForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newPageValue = updatePageInput.value.trim();
    const infoContainer = document.getElementById("progress-task-info");
    let errorEl = document.getElementById("progress-error-message");

    if (!newPageValue) {
      if (!errorEl) {
        errorEl = document.createElement("p");
        errorEl.id = "progress-error-message";
        errorEl.style.color = "red";
        infoContainer.appendChild(errorEl);
      }
      errorEl.textContent = "완료된 페이지를 입력해 주세요";
      return;
    } else if (errorEl) {
      errorEl.textContent = "";
    }

    const taskId = document.getElementById("progress-task-id").value;
    if (!taskId) {
      alert("작업 ID를 찾을 수 없습니다. 다시 시도해주세요.");
      return;
    }

    // taskId는 string이지만 task.id는 string 또는 number일 수 있으므로 양쪽 비교
    const task = tasks.find((t) => t.id == taskId || t.id === taskId);
    if (!task) {
      alert("작업 정보를 찾을 수 없습니다.");
      return;
    }

    console.log("🔍 진행 상황 업데이트 시작");
    console.log("  - Task ID:", taskId);
    console.log("  - Task 객체:", task);
    console.log("  - Task ID 타입:", typeof task.id);

    const newPage = parseInt(updatePageInput.value);
    let dateTime = updateDatetimeInput.value.trim();

    if (!dateTime) {
      dateTime = new Date().toISOString();
    } else {
      dateTime = new Date(dateTime).toISOString();
    }
    const stageKey = task.currentStage;
    const stage = task.stages[stageKey];

    if (!stage) {
      alert("현재 단계 정보를 찾을 수 없습니다.");
      return;
    }

    const lastCompletedPage =
      stage.history && stage.history.length > 0
        ? stage.history[stage.history.length - 1].endPage
        : 0;

    // 유효성 검사
    if (isNaN(newPage)) {
      alert("올바른 페이지 번호를 입력해주세요.");
      return;
    }

    if (newPage <= lastCompletedPage) {
      alert(
        `현재 완료된 페이지(${lastCompletedPage})보다 큰 값을 입력해주세요.`
      );
      return;
    }

    if (newPage > task.totalPages) {
      alert(`총 페이지(${task.totalPages})를 초과할 수 없습니다.`);
      return;
    }

    // If a session was just stopped, we need to end it on the server
    if (
      window.currentStoppedSession &&
      window.currentStoppedSession.taskId === task.id
    ) {
      const pagesWorked = newPage - window.currentStoppedSession.startPage;

      try {
        const response = await fetch(`${WORK_SESSIONS_API_URL}/end`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: task.id,
            pagesWorked: pagesWorked,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to end work session on server.");
        }

        console.log(
          `Work session for task ${task.id} ended on server with ${pagesWorked} pages.`
        );

        // Clear the session info
        window.currentStoppedSession = null;
        currentWorkSessions.delete(task.id);
      } catch (error) {
        console.error("Error ending work session:", error);
        alert(`작업 종료 처리에 실패했습니다: ${error.message}`);
        // Don't proceed with UI updates if server call fails
        return;
      }
    }

    // 진행 기록 추가
    const startPage = lastCompletedPage + 1;
    const newHistoryEntry = {
      date: new Date(dateTime).toLocaleString("ko-KR"),
      startPage: startPage,
      endPage: newPage,
    };

    // 백업용으로 기존 히스토리 저장
    if (!stage.history) {
      stage.history = [];
    }
    const originalHistory = [...stage.history];
    const originalStatus = stage.status;

    try {
      stage.history.push(newHistoryEntry);

      // 단계 완료 확인
      if (newPage === task.totalPages) {
        stage.status = "completed";
      }

      console.log("📝 saveTask 호출 전 상태:", {
        taskId: task.id,
        taskIdType: typeof task.id,
        stage: stageKey,
        newPage: newPage,
        isCompleted: newPage === task.totalPages,
        historyLength: stage.history.length,
      });

      // IMPORTANT: isNewTask를 명시적으로 false로 설정
      await saveTask(task, false); // isNewTask = false (명시적)

      console.log("✅ 진행 상황 업데이트 완료 - Task ID:", task.id);

      // 단계 완료 시 다음 단계로 이동
      if (newPage === task.totalPages) {
        const stageNames = {
          correction1: "1차 교정",
          correction2: "2차 교정",
          correction3: "3차 교정",
          finalCorrection: "최종검수",
          transcription: "점역",
        };

        const stageName = stageNames[stageKey];
        alert(
          `${stripHtmlTags(
            task.book.title
          )}의 ${stageName} 단계가 완료되었습니다!`
        );
        await moveToNextStage(task);
      }
      // Firebase 리스너가 자동으로 renderTasks()를 호출하므로 여기서는 호출하지 않음

      closeProgressUpdateModal();
    } catch (error) {
      console.error("Error updating progress:", error);

      // 실패 시 원래 상태로 복원
      stage.history = originalHistory;
      stage.status = originalStatus;

      let errorMessage = "진행 상황 업데이트에 실패했습니다.";
      if (error.message.includes("404")) {
        errorMessage =
          "해당 작업을 찾을 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.";
        // 데이터 다시 로드
        loadTasks();
      } else if (error.message.includes("500")) {
        errorMessage =
          "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      } else if (error.message.includes("timeout")) {
        errorMessage =
          "서버 응답 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.";
      }

      alert(errorMessage + ` (${error.message})`);
    }
  });

  // 다음 단계로 이동
  async function moveToNextStage(task) {
    const stagesOrder = [
      "correction1",
      "correction2",
      "correction3",
      "finalCorrection",
      "transcription",
    ];
    const currentIndex = stagesOrder.indexOf(task.currentStage);

    if (currentIndex < stagesOrder.length - 1) {
      let nextStageFound = false;

      for (let i = currentIndex + 1; i < stagesOrder.length; i++) {
        const nextStageKey = stagesOrder[i];
        const nextStage = task.stages[nextStageKey];

        if (nextStage && nextStage.status !== "not_applicable") {
          task.currentStage = nextStageKey;
          nextStage.status = "pending";

          const stageNames = {
            correction1: "1차 교정",
            correction2: "2차 교정",
            correction3: "3차 교정",
            finalCorrection: "최종 검수",
            transcription: "점역",
          };

          alert(
            `${stripHtmlTags(task.book.title)}의 다음 단계인 ${
              stageNames[nextStageKey]
            }가 시작됩니다.`
          );
          nextStageFound = true;
          break;
        }
      }

      if (!nextStageFound) {
        task.currentStage = "completed";
        alert(
          `${stripHtmlTags(task.book.title)}의 모든 작업이 완료되었습니다!`
        );
      }
    } else {
      task.currentStage = "completed";
      alert(`${stripHtmlTags(task.book.title)}의 모든 작업이 완료되었습니다!`);
    }

    try {
      await saveTask(task);
      // Firebase 리스너가 자동으로 renderTasks()를 호출하므로 여기서는 호출하지 않음
    } catch (error) {
      console.error("Error moving to next stage:", error);
      console.error("Full error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      });

      let errorMessage = "다음 단계로 이동하는 데 실패했습니다: ";

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        errorMessage +=
          "서버 연결 실패. 백엔드 서버가 실행 중인지 확인해주세요.";
      } else if (
        error.name === "AbortError" ||
        error.message.includes("timeout")
      ) {
        errorMessage += "요청 시간 초과. 네트워크 연결을 확인해주세요.";
      } else {
        errorMessage += error.message;
      }

      alert(errorMessage);
    }
  }

  // 작업 히스토리 표시
  function showTaskHistory(task) {
    const cleanTitle = stripHtmlTags(task.book.title);

    modalTitle.textContent = `${cleanTitle} - 작업 히스토리`;

    const stageNames = {
      correction1: "1차 교정",
      correction2: "2차 교정",
      correction3: "3차 교정",
      finalCorrection: "최종 검수",
      transcription: "점역",
    };

    bookInfoDiv.innerHTML = `
            <h4>도서 정보</h4>
            <p><strong>제목:</strong> ${stripHtmlTags(task.book.title)}</p>
            <p><strong>저자:</strong> ${
              stripHtmlTags(task.book.author) || "정보 없음"
            }</p>
            <p><strong>출판사:</strong> ${
              stripHtmlTags(task.book.publisher) || "정보 없음"
            }</p>
            <p><strong>ISBN:</strong> ${task.book.isbn || "정보 없음"}</p>
            <p><strong>총 페이지:</strong> ${task.totalPages}</p>
            <hr>
            <h4>진행 단계별 현황</h4>
            <div class="stage-status-section">
            ${Object.keys(stageNames)
              .map((stageKey) => {
                const stage = task.stages[stageKey];
                if (!stage || stage.status === "not_applicable") return "";

                const stageName = stageNames[stageKey];
                const currentPages =
                  stage.history && stage.history.length > 0
                    ? stage.history[stage.history.length - 1].endPage
                    : 0;
                const progressPercent = (
                  (currentPages / task.totalPages) *
                  100
                ).toFixed(1);

                let statusText = "";
                switch (stage.status) {
                  case "pending":
                    statusText =
                      task.currentStage === stageKey ? "진행 중" : "대기";
                    break;
                  case "completed":
                    statusText = "완료";
                    break;
                  default:
                    statusText = stage.status;
                }

                const historyListItems = (stage.history || [])
                  .map(
                    (entry) =>
                      `<li>${entry.date}: ${entry.startPage}~${entry.endPage} 페이지</li>`
                  )
                  .join("");

                return `
                    <div class="stage-status-card">
                        <p class="stage-status-title"><strong>${stageName}</strong></p>
                        <p>담당자: ${stage.assignedTo || "미정"}</p>
                        <p>진행률: ${currentPages} / ${
                  task.totalPages
                } 페이지 (${progressPercent}%)</p>
                        <p>상태: ${statusText}</p>
                        ${
                          historyListItems
                            ? `<div class="stage-history"><strong>진행 기록:</strong><ul class="stage-history-list">${historyListItems}</ul></div>`
                            : '<p class="stage-history-empty">진행 기록 없음</p>'
                        }
                    </div>
                `;
              })
              .join("")}
            </div>
            ${
              task.currentStage === "completed"
                ? '<p style="color: #4CAF50; font-weight: bold; text-align: center;">🎉 모든 작업이 완료되었습니다! 🎉</p>'
                : ""
            }
        `;

    taskForm.style.display = "none";
    modal.style.display = "flex";
  }

  // 서버 연결 상태 주기적 확인 (5분마다)
  setInterval(async () => {
    const isOnline = await checkServerConnection();
    if (isOnline && serverStatus === "offline") {
      serverStatus = "online";
      updateStatusDisplay();
      console.log("Server is back online");

      // 서버가 다시 온라인이 되면 데이터 다시 로드
      const shouldReload = confirm(
        "서버가 다시 연결되었습니다. 최신 데이터를 불러오시겠습니까?"
      );
      if (shouldReload) {
        await loadTasks();
      }
    }
  }, 300000); // 5분

  // 네트워크 상태 변경 감지
  window.addEventListener("online", async () => {
    console.log("Network back online");
    const isServerOnline = await checkServerConnection();
    if (isServerOnline && serverStatus === "offline") {
      serverStatus = "online";
      updateStatusDisplay();
    }
  });

  window.addEventListener("offline", () => {
    console.log("Network went offline");
    if (serverStatus === "online") {
      serverStatus = "offline";
      updateStatusDisplay();
    }
  });

  // Notes Modal Functions
  function openNotesModal(task) {
    currentTaskForNotes = task;
    notesModalTitle.textContent = `특이사항 - ${stripHtmlTags(
      task.book.title
    )}`;
    noteForm.reset();
    noteIdInput.value = "";
    loadAndRenderNotes(task.id);
    notesModal.style.display = "flex";
  }

  function closeNotesModal() {
    notesModal.style.display = "none";
    currentTaskForNotes = null;
  }

  // 도서 선택 모달 표시
  function showBookSelectionModal(books) {
    bookSelectionList.innerHTML = "";

    books.forEach((book) => {
      const bookItem = document.createElement("div");
      bookItem.className = "book-selection-item";
      bookItem.innerHTML = `
                <h4>${book.titleInfo || "제목 없음"}</h4>
                <p><strong>저자:</strong> ${
                  book.authorInfo || "저자 정보 없음"
                }</p>
                <p><strong>출판사:</strong> ${
                  book.pubInfo || "출판사 정보 없음"
                }</p>
                <p><strong>ISBN:</strong> ${book.isbn || "ISBN 없음"}</p>
                <p><strong>출간연도:</strong> ${
                  book.pubYearInfo || "출간연도 정보 없음"
                }</p>
            `;

      bookItem.addEventListener("click", () => {
        selectBook(book);
        closeBookSelectionModal();
      });

      bookSelectionList.appendChild(bookItem);
    });

    bookSelectionModal.style.display = "flex";
  }

  // 도서 선택 처리
  function selectBook(book) {
    const bookInfo = {
      title: book.titleInfo || "",
      author: book.authorInfo || "",
      publisher: book.pubInfo || "",
      isbn: book.isbn || "",
      totalPages: null,
    };
    openModal("도서 정보 확인 및 등록", bookInfo);
  }

  // 도서 선택 모달 닫기
  function closeBookSelectionModal() {
    bookSelectionModal.style.display = "none";
  }

  // 진행률 계산 함수
  function calculateProgress(task) {
    if (task.currentStage === "completed") {
      return 100;
    }

    if (!task.currentStage || !task.stages[task.currentStage]) {
      return 0;
    }

    const stage = task.stages[task.currentStage];
    if (!stage.history || stage.history.length === 0) {
      return 0;
    }

    const currentPage = stage.history[stage.history.length - 1].endPage;
    return Math.round((currentPage / task.totalPages) * 100);
  }

  async function loadAndRenderNotes(taskId) {
    try {
      const notes = await FirebaseNotes.getAll(taskId);
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        task.notes = notes;
      }
      renderNotes(notes, taskId);
      renderTasks(); // Update note count on the button
    } catch (error) {
      console.error("Error loading notes from Firebase:", error);
      notesList.innerHTML = `<p>특이사항을 불러오는데 실패했습니다.</p>`;
    }
  }

  function renderNotes(notes, taskId) {
    notesList.innerHTML = "";
    if (notes.length === 0) {
      notesList.innerHTML = "<p>등록된 특이사항이 없습니다.</p>";
      return;
    }

    notes.forEach((note) => {
      const noteItem = document.createElement("div");
      noteItem.classList.add("note-item");
      noteItem.dataset.noteId = note.noteId;

      noteItem.innerHTML = `
                <p class="note-meta"><strong>작성자:</strong> ${
                  note.author
                } | <strong>작성일:</strong> ${new Date(
        note.createdAt
      ).toLocaleString("ko-KR")}</p>
                <p>${note.content}</p>
                <div class="note-actions">
                    <button class="edit-note-button">수정</button>
                    <button class="delete-note-button">삭제</button>
                </div>
            `;

      noteItem
        .querySelector(".edit-note-button")
        .addEventListener("click", () => {
          noteIdInput.value = note.noteId;
          noteAuthorInput.value = note.author;
          noteContentInput.value = note.content;
        });

      noteItem
        .querySelector(".delete-note-button")
        .addEventListener("click", () => {
          if (confirm("정말로 이 특이사항을 삭제하시겠습니까?")) {
            deleteNote(taskId, note.noteId);
          }
        });

      notesList.appendChild(noteItem);
    });
  }

  noteForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const taskId = currentTaskForNotes.id;
    const noteId = noteIdInput.value;
    const author = noteAuthorInput.value.trim();
    const content = noteContentInput.value.trim();

    if (!author || !content) {
      alert("작성자와 내용을 모두 입력해주세요.");
      return;
    }

    try {
      if (noteId) {
        // Update existing note
        await FirebaseNotes.update(taskId, noteId, { author, content });
      } else {
        // Create new note
        await FirebaseNotes.create(taskId, { author, content });
      }

      noteForm.reset();
      noteIdInput.value = "";
      loadAndRenderNotes(taskId);
    } catch (error) {
      console.error("Error saving note to Firebase:", error);
      alert("특이사항 저장에 실패했습니다: " + error.message);
    }
  });

  async function deleteNote(taskId, noteId) {
    try {
      await FirebaseNotes.delete(taskId, noteId);
      loadAndRenderNotes(taskId);
    } catch (error) {
      console.error("Error deleting note from Firebase:", error);
      alert("특이사항 삭제에 실패했습니다: " + error.message);
    }
  }

  notesModalCloseButton.addEventListener("click", closeNotesModal);

  // 도서 선택 모달 닫기 버튼 이벤트
  bookSelectionCloseButton.addEventListener("click", closeBookSelectionModal);

  // 관리자 모드 기능
  function authenticateAdmin() {
    console.log("Admin button clicked");
    openPasswordModal();
  }

  function openPasswordModal() {
    console.log("Opening password modal");
    adminPasswordInput.value = "";
    passwordModal.style.display = "flex";
    setTimeout(() => adminPasswordInput.focus(), 100);
  }

  function closePasswordModal() {
    passwordModal.style.display = "none";
    adminPasswordInput.value = "";
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();
    const password = adminPasswordInput.value;
    console.log("Password submitted:", password);

    if (password === "maccreytask") {
      console.log("Password correct, opening admin panel");
      isAdminMode = true;
      closePasswordModal();
      openAdminPanel();
    } else {
      console.log("Password incorrect");
      adminPasswordInput.value = "";
      adminPasswordInput.style.borderColor = "#dc3545";
      adminPasswordInput.style.backgroundColor = "#fff5f5";

      setTimeout(() => {
        adminPasswordInput.style.borderColor = "";
        adminPasswordInput.style.backgroundColor = "";
        adminPasswordInput.focus();
      }, 1000);
    }
  }

  function openAdminPanel() {
    if (!isAdminMode) return;

    adminPanelModal.style.display = "flex";
    // 기본적으로 tasks 탭으로 시작하되, 이미 다른 탭이 활성화되어 있다면 유지
    if (!currentActiveTab || currentActiveTab === "tasks") {
      switchTab("tasks");
    } else {
      switchTab(currentActiveTab);
    }
    loadAdminData();
  }

  function closeAdminPanel() {
    adminPanelModal.style.display = "none";
    isAdminMode = false;
    currentEditingRow = null;
  }

  // 현재 활성 탭을 추적하는 변수
  let currentActiveTab = "tasks";

  // 직원 작업 중 모달 닫기 방지 플래그
  let isStaffOperationInProgress = false;

  function switchTab(tabName) {
    console.log(
      `Switching to tab: ${tabName}, previous tab: ${currentActiveTab}`
    );
    currentActiveTab = tabName;

    // 탭 버튼 활성화
    tabButtons.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.tab === tabName) {
        btn.classList.add("active");
      }
    });

    // 탭 내용 표시
    tabContents.forEach((content) => {
      content.classList.remove("active");
      if (content.id === `admin-tab-${tabName}`) {
        content.classList.add("active");
      }
    });

    // 탭별 데이터 로드
    if (tabName === "tasks") {
      loadAdminTasks();
    } else if (tabName === "data") {
      loadDataInfo();
    } else if (tabName === "staff") {
      renderStaffList();
    } else if (tabName === "attendance") {
      loadAttendanceData();
    } else if (tabName === "stats") {
      loadStatistics();
    }

    console.log(`Tab switched successfully to: ${currentActiveTab}`);
  }

  async function loadAdminData() {
    try {
      // Firebase에서 데이터 가져오기
      tasks = await FirebaseBooks.getAll();
      loadAdminTasks();
      loadDataInfo();
      loadStatistics();
      loadDataStatus(); // 새로운 데이터 상태 로드
    } catch (error) {
      console.error("Failed to load admin data:", error);
      alert("데이터 로드 실패: " + error.message);
    }
  }

  function loadAdminTasks() {
    adminTasksTbody.innerHTML = "";

    tasks.forEach((task) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${task.id}</td>
                <td class="editable task-clickable" data-field="title" data-task-id="${
                  task.id
                }">${stripHtmlTags(task.book.title) || ""}</td>
                <td class="editable" data-field="author">${
                  stripHtmlTags(task.book.author) || ""
                }</td>
                <td>${getStageDisplayName(task.currentStage)}</td>
                <td>${calculateProgress(task)}%</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editTask('${
                      task.id
                    }')">수정</button>
                    <button class="action-btn delete-btn" onclick="deleteTask('${
                      task.id
                    }')">삭제</button>
                </td>
            `;
      row.dataset.taskId = task.id;
      adminTasksTbody.appendChild(row);
    });

    // 제목 클릭 시 상세 모달 열기
    document.querySelectorAll(".task-clickable").forEach((cell) => {
      cell.addEventListener("click", (e) => {
        if (currentEditingRow) return; // 편집 중일 때는 클릭 무시
        const taskId = e.target.dataset.taskId;
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          openTaskDetailModal(task);
        }
      });
    });
  }

  function getStageDisplayName(stage) {
    const stageNames = {
      correction1: "1차 교정",
      correction2: "2차 교정",
      correction3: "3차 교정",
      finalCorrection: "최종검수",
      transcription: "점역",
      completed: "완료",
    };
    return stageNames[stage] || stage;
  }

  function loadDataInfo() {
    const dataInfo = document.getElementById("data-info");
    // 구 버전 호환성을 위해 요소가 존재할 때만 업데이트
    if (dataInfo) {
      dataInfo.innerHTML = `
            <p><strong>총 작업 수:</strong> ${tasks.length}개</p>
            <p><strong>마지막 업데이트:</strong> ${new Date().toLocaleString(
              "ko-KR"
            )}</p>
            <p><strong>서버 상태:</strong> ${
              serverStatus === "online" ? "온라인" : "오프라인"
            }</p>
            <p><strong>데이터베이스 크기:</strong> ${Math.round(
              JSON.stringify(tasks).length / 1024
            )}KB</p>
        `;
    }
  }

  function loadStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(
      (task) => calculateProgress(task) === 100
    ).length;
    const inProgress = total - completed;
    const avgProgress =
      total > 0
        ? Math.round(
            tasks.reduce((sum, task) => sum + calculateProgress(task), 0) /
              total
          )
        : 0;

    document.getElementById("total-tasks").textContent = total;
    document.getElementById("completed-tasks").textContent = completed;
    document.getElementById("in-progress-tasks").textContent = inProgress;
    document.getElementById("avg-progress").textContent = avgProgress + "%";

    // 단계별 분포
    const stageDistribution = {};
    tasks.forEach((task) => {
      const stage = getStageDisplayName(task.currentStage);
      stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;
    });

    const stageChart = document.getElementById("stage-distribution");
    stageChart.innerHTML = "";
    Object.entries(stageDistribution).forEach(([stage, count]) => {
      const stageItem = document.createElement("div");
      stageItem.className = "stage-item";
      stageItem.innerHTML = `
                <h4>${stage}</h4>
                <div class="stage-count">${count}</div>
            `;
      stageChart.appendChild(stageItem);
    });
  }

  // 개선된 데이터 관리 기능

  // 중복/손상된 책 항목 찾기 및 수정
  async function findAndFixDuplicateBooks() {
    try {
      const books = await FirebaseBooks.getAll();
      console.log("📚 전체 책 목록:", books.length);

      // 중복 및 문제 항목 찾기
      const issues = [];
      const booksByTitle = new Map();
      const invalidIds = [];

      books.forEach((book, index) => {
        // ID 검증
        if (!book.id || book.id === "undefined" || book.id === "null") {
          invalidIds.push({ book, index });
          issues.push(
            `책 ${index + 1}: 잘못된 ID (${book.id}) - "${
              book.book?.title || "제목 없음"
            }"`
          );
        }

        // 제목으로 중복 검사
        const title = book.book?.title;
        if (title) {
          if (booksByTitle.has(title)) {
            const existing = booksByTitle.get(title);
            issues.push(
              `중복된 책: "${title}" (ID: ${existing.id}, ${book.id})`
            );
          } else {
            booksByTitle.set(title, book);
          }
        }
      });

      if (issues.length === 0) {
        alert("중복이나 손상된 데이터가 없습니다.");
        return;
      }

      // 문제 항목 표시
      const message = `발견된 문제:\n\n${issues.join(
        "\n"
      )}\n\n잘못된 ID를 가진 ${invalidIds.length}개 항목을 삭제하시겠습니까?`;

      if (confirm(message)) {
        // 잘못된 ID 항목 삭제
        for (const { book } of invalidIds) {
          try {
            await FirebaseBooks.delete(book.id);
            console.log(`❌ 삭제됨: ID=${book.id}, 제목=${book.book?.title}`);
          } catch (error) {
            console.error(`삭제 실패: ID=${book.id}`, error);
          }
        }

        alert(`${invalidIds.length}개의 잘못된 항목을 삭제했습니다.`);
        loadTasks(); // 새로고침
      }
    } catch (error) {
      console.error("중복 검사 실패:", error);
      alert("중복 검사에 실패했습니다: " + error.message);
    }
  }

  // 데이터 상태 정보 로드
  async function loadDataStatus() {
    try {
      // Firebase에서 직접 카운트
      const [books, staffList, workSessionsHistory] = await Promise.all([
        FirebaseBooks.getAll(),
        FirebaseStaff.getAll(),
        FirebaseWorkSessionsHistory.getAll(),
      ]);

      const booksInfo = {
        count: books.length,
        lastModified: new Date().toISOString(),
        source: "firebase",
      };
      const staffInfo = {
        count: staffList.length,
        lastModified: new Date().toISOString(),
        source: "firebase",
      };
      const workSessionsInfo = {
        count: workSessionsHistory.length,
        lastModified: new Date().toISOString(),
        source: "firebase",
      };

      updateDataStatus("books", booksInfo);
      updateDataStatus("staff", staffInfo);
      updateDataStatus("work-sessions", workSessionsInfo);
    } catch (error) {
      console.error("데이터 상태 로드 실패:", error);
    }
  }

  function updateDataStatus(type, info) {
    const statusElement = document.getElementById(`${type}-status`);
    if (!statusElement) return;

    const countElement = statusElement.querySelector(".data-count");
    const modifiedElement = statusElement.querySelector(".data-modified");

    if (countElement) {
      countElement.textContent = `${info.count}개 항목`;
    }

    if (modifiedElement && info.lastModified) {
      const date = new Date(info.lastModified);
      modifiedElement.textContent = `최종 수정: ${date.toLocaleString(
        "ko-KR"
      )}`;
    } else if (modifiedElement) {
      modifiedElement.textContent = "최종 수정: -";
    }
  }

  // 백업 함수들 (Firebase 사용)
  async function backupBooks() {
    try {
      const booksData = await FirebaseBooks.getAll();
      const dataStr = JSON.stringify(booksData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      downloadFile(blob, `books_backup_${getDateString()}.json`);
      showSuccessMessage("책 정보 데이터가 백업되었습니다.");
    } catch (error) {
      console.error("책 정보 백업 실패:", error);
      showErrorMessage("책 정보 백업 중 오류가 발생했습니다.");
    }
  }

  async function backupStaff() {
    try {
      const staffData = await FirebaseStaff.getAll();
      const dataStr = JSON.stringify(staffData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      downloadFile(blob, `staff_backup_${getDateString()}.json`);
      showSuccessMessage("직원 정보 데이터가 백업되었습니다.");
    } catch (error) {
      console.error("직원 정보 백업 실패:", error);
      showErrorMessage("직원 정보 백업 중 오류가 발생했습니다.");
    }
  }

  async function backupWorkSessions() {
    try {
      const workSessionsData = await FirebaseWorkSessionsHistory.getAll();
      const dataStr = JSON.stringify(workSessionsData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      downloadFile(blob, `work_sessions_backup_${getDateString()}.json`);
      showSuccessMessage("출퇴근 기록 데이터가 백업되었습니다.");
    } catch (error) {
      console.error("출퇴근 기록 백업 실패:", error);
      showErrorMessage("출퇴근 기록 백업 중 오류가 발생했습니다.");
    }
  }

  async function backupAll() {
    try {
      showLoadingMessage("전체 데이터를 백업하는 중...");

      const [booksData, staffData, workSessionsData] = await Promise.all([
        FirebaseBooks.getAll(),
        FirebaseStaff.getAll(),
        FirebaseWorkSessionsHistory.getAll(),
      ]);

      const allData = {
        books: booksData,
        staff: staffData,
        workSessions: workSessionsData,
        backupDate: new Date().toISOString(),
        version: "1.0",
      };

      const dataStr = JSON.stringify(allData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      downloadFile(blob, `complete_backup_${getDateString()}.json`);

      hideLoadingMessage();
      showSuccessMessage("전체 데이터가 백업되었습니다.");
    } catch (error) {
      console.error("전체 백업 실패:", error);
      hideLoadingMessage();
      showErrorMessage("전체 백업 중 오류가 발생했습니다.");
    }
  }

  // 복원 함수들
  function restoreBooks() {
    document.getElementById("restore-books-input").click();
  }

  function restoreStaff() {
    document.getElementById("restore-staff-input").click();
  }

  function restoreWorkSessions() {
    document.getElementById("restore-work-sessions-input").click();
  }

  async function handleBooksRestore(event) {
    await handleRestore(event, "books", "/api/books/restore", "책 정보");
  }

  async function handleStaffRestore(event) {
    await handleRestore(event, "staff", "/api/staff/restore", "직원 정보");
  }

  async function handleWorkSessionsRestore(event) {
    await handleRestore(
      event,
      "work-sessions",
      "/api/work-sessions-history/restore",
      "출퇴근 기록"
    );
  }

  async function handleRestore(event, type, endpoint, dataName) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      if (!Array.isArray(backupData)) {
        throw new Error("잘못된 백업 파일 형식입니다.");
      }

      if (
        confirm(
          `${backupData.length}개의 ${dataName} 항목을 복원하시겠습니까? 현재 데이터는 모두 교체됩니다.`
        )
      ) {
        showLoadingMessage(`${dataName} 데이터를 복원하는 중...`);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(backupData),
        });

        if (!response.ok) {
          throw new Error(`복원 실패: ${response.statusText}`);
        }

        const result = await response.json();

        hideLoadingMessage();
        showSuccessMessage(
          `${dataName} 데이터가 성공적으로 복원되었습니다. (${result.count}개 항목)`
        );

        // 관련 데이터 새로고침
        if (type === "books") {
          await loadTasks();
        }
        loadAdminData();
        loadDataStatus();
      }
    } catch (error) {
      console.error(`${dataName} 복원 중 오류:`, error);
      hideLoadingMessage();
      showErrorMessage(
        `${dataName} 데이터 복원 중 오류가 발생했습니다: ${error.message}`
      );
    }

    event.target.value = "";
  }

  // 삭제 관련 변수
  let pendingDeleteAction = null;

  // 삭제 확인 모달 관련 함수들
  function showDeleteConfirmModal(message, deleteAction) {
    const modal = document.getElementById("delete-confirm-modal");
    const messageElement = document.getElementById("delete-confirm-message");
    const passwordInput = document.getElementById("delete-password");

    messageElement.textContent = message;
    passwordInput.value = "";
    pendingDeleteAction = deleteAction;

    modal.style.display = "flex";
    passwordInput.focus();
  }

  function hideDeleteConfirmModal() {
    const modal = document.getElementById("delete-confirm-modal");
    modal.style.display = "none";
    pendingDeleteAction = null;
  }

  async function confirmDelete() {
    const password = document.getElementById("delete-password").value;

    if (password !== "재활용") {
      showErrorMessage("올바른 삭제 암호를 입력해주세요.");
      return;
    }

    if (pendingDeleteAction) {
      hideDeleteConfirmModal();
      await pendingDeleteAction();
    }
  }

  // 삭제 함수들
  async function clearBooks() {
    showDeleteConfirmModal(
      "정말로 모든 책 정보 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      async () => {
        try {
          showLoadingMessage("책 정보 데이터를 삭제하는 중...");

          const response = await fetch(`${BASE_URL}/api/books/clear`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: "재활용" }),
          });

          if (!response.ok) {
            throw new Error("삭제 실패");
          }

          hideLoadingMessage();
          showSuccessMessage("책 정보 데이터가 삭제되었습니다.");
          await loadTasks();
          loadAdminData();
          loadDataStatus();
        } catch (error) {
          console.error("책 정보 삭제 실패:", error);
          hideLoadingMessage();
          showErrorMessage("책 정보 삭제 중 오류가 발생했습니다.");
        }
      }
    );
  }

  async function clearStaff() {
    showDeleteConfirmModal(
      "정말로 모든 직원 정보 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      async () => {
        try {
          showLoadingMessage("직원 정보 데이터를 삭제하는 중...");

          const response = await fetch(`${BASE_URL}/api/staff/clear`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: "재활용" }),
          });

          if (!response.ok) {
            throw new Error("삭제 실패");
          }

          hideLoadingMessage();
          showSuccessMessage("직원 정보 데이터가 삭제되었습니다.");
          loadAdminData();
          loadDataStatus();
        } catch (error) {
          console.error("직원 정보 삭제 실패:", error);
          hideLoadingMessage();
          showErrorMessage("직원 정보 삭제 중 오류가 발생했습니다.");
        }
      }
    );
  }

  async function clearWorkSessions() {
    showDeleteConfirmModal(
      "정말로 모든 출퇴근 기록 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      async () => {
        try {
          showLoadingMessage("출퇴근 기록 데이터를 삭제하는 중...");

          const response = await fetch(
            `${BASE_URL}/api/work-sessions-history/clear`,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ password: "재활용" }),
            }
          );

          if (!response.ok) {
            throw new Error("삭제 실패");
          }

          hideLoadingMessage();
          showSuccessMessage("출퇴근 기록 데이터가 삭제되었습니다.");
          loadAdminData();
          loadDataStatus();
        } catch (error) {
          console.error("출퇴근 기록 삭제 실패:", error);
          hideLoadingMessage();
          showErrorMessage("출퇴근 기록 삭제 중 오류가 발생했습니다.");
        }
      }
    );
  }

  // 유틸리티 함수들
  function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function getDateString() {
    return new Date().toISOString().split("T")[0];
  }

  function showSuccessMessage(message) {
    alert(`✅ ${message}`);
  }

  function showErrorMessage(message) {
    alert(`❌ ${message}`);
  }

  function showLoadingMessage(message) {
    // 간단한 로딩 메시지 (나중에 더 예쁜 로딩 UI로 교체 가능)
    console.log(`🔄 ${message}`);
  }

  function hideLoadingMessage() {
    console.log("✅ 작업 완료");
  }

  // 기존 함수들 (호환성 유지)
  function backupData() {
    backupBooks();
  }

  function restoreData() {
    restoreBooks();
  }

  async function clearAllData(confirm = true) {
    if (
      confirm &&
      !window.confirm(
        "정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      return;
    }

    try {
      const deletePromises = tasks.map((task) =>
        fetch(`${API_URL}/${task.id}`, { method: "DELETE" }).catch((error) =>
          console.error(`Failed to delete task ${task.id}:`, error)
        )
      );

      await Promise.all(deletePromises);
      tasks = [];
      renderTasks();
      loadAdminData();

      if (confirm) alert("모든 데이터가 삭제되었습니다.");
    } catch (error) {
      alert("데이터 삭제 중 오류가 발생했습니다: " + error.message);
    }
  }

  // 전역 함수들 (HTML에서 호출)
  window.editTask = function (taskId) {
    if (currentEditingRow) {
      cancelEdit();
    }

    const row = document.querySelector(`tr[data-task-id="${taskId}"]`);
    const editables = row.querySelectorAll(".editable");

    editables.forEach((cell) => {
      const currentValue = cell.textContent;
      const field = cell.dataset.field;
      cell.innerHTML = `<input type="text" value="${currentValue}" class="admin-edit-input">`;
    });

    const actionCell = row.querySelector("td:last-child");
    actionCell.innerHTML = `
            <button class="action-btn save-btn" onclick="saveTask('${taskId}')">저장</button>
            <button class="action-btn cancel-btn" onclick="cancelEdit()">취소</button>
        `;

    currentEditingRow = row;
  };

  window.saveTask = async function (taskId) {
    const row = currentEditingRow;
    const inputs = row.querySelectorAll(".admin-edit-input");
    const task = tasks.find((t) => t.id === taskId);

    if (!task) return;

    inputs.forEach((input) => {
      const cell = input.parentElement;
      const field = cell.dataset.field;
      const value = input.value.trim();

      if (field === "title") {
        task.book.title = value;
      } else if (field === "author") {
        task.book.author = value;
      }
    });

    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });

      if (response.ok) {
        await loadTasks();
        loadAdminTasks();
        alert("작업이 수정되었습니다.");
      } else {
        throw new Error("서버 오류");
      }
    } catch (error) {
      alert("수정 실패: " + error.message);
    }

    currentEditingRow = null;
  };

  window.cancelEdit = function () {
    if (currentEditingRow) {
      loadAdminTasks();
      currentEditingRow = null;
    }
  };

  window.deleteTask = async function (taskId) {
    if (!confirm("정말로 이 작업을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadTasks();
        loadAdminData();
        alert("작업이 삭제되었습니다.");
      } else {
        throw new Error("서버 오류");
      }
    } catch (error) {
      alert("삭제 실패: " + error.message);
    }
  };

  // 이벤트 리스너들
  console.log("adminModeButton:", adminModeButton);
  console.log("passwordModal:", passwordModal);
  console.log("passwordForm:", passwordForm);

  if (adminModeButton) {
    adminModeButton.addEventListener("click", authenticateAdmin);
    console.log("Admin button event listener added");
  } else {
    console.error("Admin mode button not found!");
  }
  adminPanelCloseButton.addEventListener("click", closeAdminPanel);

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // 새로운 데이터 관리 버튼들

  // 책 정보 관리
  document
    .getElementById("check-duplicates-btn")
    .addEventListener("click", findAndFixDuplicateBooks);
  document
    .getElementById("backup-books-btn")
    .addEventListener("click", backupBooks);
  document
    .getElementById("restore-books-btn")
    .addEventListener("click", restoreBooks);
  document
    .getElementById("clear-books-btn")
    .addEventListener("click", clearBooks);
  document
    .getElementById("restore-books-input")
    .addEventListener("change", handleBooksRestore);

  // 직원 정보 관리
  document
    .getElementById("backup-staff-btn")
    .addEventListener("click", backupStaff);
  document
    .getElementById("restore-staff-btn")
    .addEventListener("click", restoreStaff);
  document
    .getElementById("clear-staff-btn")
    .addEventListener("click", clearStaff);
  document
    .getElementById("restore-staff-input")
    .addEventListener("change", handleStaffRestore);

  document
    .getElementById("merge-work-sessions-btn")
    ?.addEventListener("click", async () => {
      if (
        confirm(
          "기존 출퇴근 기록을 병합하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        )
      ) {
        try {
          await FirebaseWorkSessionsHistory.mergeWorkSessions();
          alert("출퇴근 기록이 성공적으로 병합되었습니다.");
          loadAttendanceData(); // Refresh the view
        } catch (error) {
          console.error("Error merging work sessions:", error);
          alert("출퇴근 기록 병합 중 오류가 발생했습니다.");
        }
      }
    });

  // 출퇴근 기록 관리
  document
    .getElementById("backup-work-sessions-btn")
    .addEventListener("click", backupWorkSessions);
  document
    .getElementById("restore-work-sessions-btn")
    .addEventListener("click", restoreWorkSessions);
  document
    .getElementById("clear-work-sessions-btn")
    .addEventListener("click", clearWorkSessions);
  document
    .getElementById("restore-work-sessions-input")
    .addEventListener("change", handleWorkSessionsRestore);

  // 전체 관리
  document
    .getElementById("backup-all-btn")
    .addEventListener("click", backupAll);
  document
    .getElementById("clear-all-data-btn")
    .addEventListener("click", () => {
      showDeleteConfirmModal(
        "정말로 모든 데이터를 삭제하시겠습니까? 책 정보, 직원 정보, 출퇴근 기록이 모두 삭제됩니다. 이 작업은 되돌릴 수 없습니다.",
        async () => {
          try {
            showLoadingMessage("모든 데이터를 삭제하는 중...");

            await Promise.all([
              fetch(`${BASE_URL}/api/books/clear`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: "재활용" }),
              }),
              fetch(`${BASE_URL}/api/staff/clear`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: "재활용" }),
              }),
              fetch(`${BASE_URL}/api/work-sessions-history/clear`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: "재활용" }),
              }),
            ]);

            hideLoadingMessage();
            showSuccessMessage("모든 데이터가 삭제되었습니다.");
            await loadTasks();
            loadAdminData();
            loadDataStatus();
          } catch (error) {
            console.error("전체 데이터 삭제 실패:", error);
            hideLoadingMessage();
            showErrorMessage("데이터 삭제 중 오류가 발생했습니다.");
          }
        }
      );
    });

  // 삭제 확인 모달 버튼들
  document
    .getElementById("confirm-delete-btn")
    .addEventListener("click", confirmDelete);
  document
    .getElementById("cancel-delete-btn")
    .addEventListener("click", hideDeleteConfirmModal);

  // 암호 입력 시 엔터키 처리
  document
    .getElementById("delete-password")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        confirmDelete();
      }
    });

  // 모달 외부 클릭 시 닫기
  document
    .getElementById("delete-confirm-modal")
    .addEventListener("click", (e) => {
      if (e.target.id === "delete-confirm-modal") {
        hideDeleteConfirmModal();
      }
    });

  // 새로고침 및 내보내기 버튼
  document
    .getElementById("refresh-tasks-btn")
    .addEventListener("click", loadAdminData);
  document
    .getElementById("export-tasks-btn")
    .addEventListener("click", backupData);

  // Task Detail Modal 기능
  function openTaskDetailModal(task) {
    currentDetailTask = task;

    // 기본 정보 탭 데이터 채우기
    document.getElementById("detail-title").value = task.book.title || "";
    document.getElementById("detail-author").value = task.book.author || "";
    document.getElementById("detail-publisher").value =
      task.book.publisher || "";
    document.getElementById("detail-isbn").value = task.book.isbn || "";
    document.getElementById("detail-total-pages").value = task.totalPages || "";
    document.getElementById("detail-current-stage").value =
      task.currentStage || "correction1";

    // 작업 단계 탭 데이터 채우기
    fillStagesData(task);

    // 진행 기록 탭 데이터 채우기
    fillHistoryData(task);

    // 첫 번째 탭 활성화
    switchDetailTab("info");

    // 모달 표시
    taskDetailModal.style.display = "flex";
  }

  function fillStagesData(task) {
    const stages = [
      { ui: "corrector1", db: "correction1" },
      { ui: "corrector2", db: "correction2" },
      { ui: "corrector3", db: "correction3" },
      { ui: "transcriber", db: "transcription" },
    ];

    stages.forEach((stage) => {
      const stageData = task.stages && task.stages[stage.db];

      // 담당자 설정 (드롭다운)
      const assignedSelect = document.getElementById(`${stage.ui}-assigned`);
      if (assignedSelect) {
        // 현재 값 임시 저장
        const currentValue = stageData?.assignedTo || "";

        // 드롭다운이 이미 업데이트되어 있어야 함
        updateStaffDropdowns();

        // 값 설정
        if (
          currentValue &&
          Array.from(assignedSelect.options).some(
            (opt) => opt.value === currentValue
          )
        ) {
          assignedSelect.value = currentValue;
        }
      }

      // 진행 페이지 설정
      const progressSpan = document.getElementById(`${stage.ui}-progress`);
      if (progressSpan) {
        let currentPage = 0;
        if (stageData && stageData.history && stageData.history.length > 0) {
          currentPage =
            stageData.history[stageData.history.length - 1].endPage || 0;
        }
        progressSpan.textContent = currentPage;
      }
    });
  }

  function fillHistoryData(task) {
    const historyContainer = document.getElementById("history-container");
    historyContainer.innerHTML = "";

    if (!task.stages) {
      historyContainer.innerHTML = "<p>진행 기록이 없습니다.</p>";
      return;
    }

    const stageNames = {
      correction1: "1차 교정",
      correction2: "2차 교정",
      correction3: "3차 교정",
      transcription: "점역",
    };

    Object.entries(task.stages).forEach(([stageKey, stageData]) => {
      const stageName = stageNames[stageKey] || stageKey;
      const stageDiv = document.createElement("div");
      stageDiv.className = "history-stage";

      let historyHtml = `<h5>${stageName}</h5>`;
      historyHtml += `<p><strong>담당자:</strong> ${
        stageData.assignedTo || "미정"
      }</p>`;

      if (stageData.history && stageData.history.length > 0) {
        historyHtml += "<div>";
        stageData.history.forEach((entry) => {
          let date;
          try {
            const parsedDate = parseKoreanDate(entry.date);
            date = parsedDate ? parsedDate.toLocaleString("ko-KR") : entry.date;
          } catch (error) {
            console.warn("Date parsing error:", error);
            date = entry.date || "날짜 정보 없음";
          }
          historyHtml += `
                        <div class="history-entry">
                            <div>${entry.startPage}페이지 → ${entry.endPage}페이지</div>
                            <div class="date">${date}</div>
                        </div>
                    `;
        });
        historyHtml += "</div>";
      } else {
        historyHtml += "<p>진행 기록 없음</p>";
      }

      stageDiv.innerHTML = historyHtml;
      historyContainer.appendChild(stageDiv);
    });
  }

  function switchDetailTab(tabName) {
    // 탭 버튼 활성화
    detailTabButtons.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.tab === tabName) {
        btn.classList.add("active");
      }
    });

    // 탭 내용 표시
    detailTabContents.forEach((content) => {
      content.classList.remove("active");
      if (content.id === `task-detail-${tabName}`) {
        content.classList.add("active");
      }
    });
  }

  function closeTaskDetailModal() {
    taskDetailModal.style.display = "none";
    currentDetailTask = null;
  }

  async function saveTaskDetail() {
    if (!currentDetailTask) return;

    try {
      // 기본 정보 수집
      const formData = new FormData(taskDetailForm);
      const updatedTask = { ...currentDetailTask };

      updatedTask.book.title = formData.get("title") || "";
      updatedTask.book.author = formData.get("author") || "";
      updatedTask.book.publisher = formData.get("publisher") || "";
      updatedTask.book.isbn = formData.get("isbn") || "";
      updatedTask.totalPages = parseInt(formData.get("totalPages")) || 0;
      updatedTask.currentStage = formData.get("currentStage") || "correction1";

      // 작업 단계 담당자 수집
      const stages = [
        { ui: "corrector1", db: "correction1" },
        { ui: "corrector2", db: "correction2" },
        { ui: "corrector3", db: "correction3" },
        { ui: "transcriber", db: "transcription" },
      ];
      stages.forEach((stage) => {
        const assignedSelect = document.getElementById(`${stage.ui}-assigned`);
        if (assignedSelect) {
          if (!updatedTask.stages) updatedTask.stages = {};
          if (!updatedTask.stages[stage.db])
            updatedTask.stages[stage.db] = { history: [] };
          updatedTask.stages[stage.db].assignedTo = assignedSelect.value;
        }
      });

      const finalCorrectorAssigned = document.getElementById(
        "final-corrector-assigned"
      ).value;
      updatedTask.stages.finalCorrection.assignedTo = finalCorrectorAssigned;

      // 서버에 저장
      const response = await fetch(`${API_URL}/${currentDetailTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });

      if (response.ok) {
        await loadTasks();
        loadAdminData();
        closeTaskDetailModal();
        alert("작업이 성공적으로 저장되었습니다.");
      } else {
        throw new Error("서버 오류");
      }
    } catch (error) {
      alert("저장 실패: " + error.message);
    }
  }

  async function deleteTaskDetail() {
    if (!currentDetailTask) return;

    if (!confirm("정말로 이 작업을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`${API_URL}/${currentDetailTask.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadTasks();
        loadAdminData();
        closeTaskDetailModal();
        alert("작업이 삭제되었습니다.");
      } else {
        throw new Error("서버 오류");
      }
    } catch (error) {
      alert("삭제 실패: " + error.message);
    }
  }

  // Task Detail Modal 이벤트 리스너들
  taskDetailCloseButton.addEventListener("click", closeTaskDetailModal);
  cancelTaskDetailBtn.addEventListener("click", closeTaskDetailModal);
  saveTaskDetailBtn.addEventListener("click", saveTaskDetail);
  deleteTaskDetailBtn.addEventListener("click", deleteTaskDetail);

  detailTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchDetailTab(btn.dataset.tab));
  });

  // 모달 외부 클릭 시 닫기
  window.addEventListener("click", (event) => {
    if (event.target === taskDetailModal) {
      closeTaskDetailModal();
    }
    if (event.target === completedBooksModal) {
      closeCompletedBooksModal();
    }
    if (event.target === passwordModal) {
      closePasswordModal();
    }
    if (event.target === assignCorrectorModal) {
      closeAssignCorrectorModal();
    }
  });

  // 완료된 도서 모달 기능
  function openCompletedBooksModal() {
    loadCompletedBooks();
    completedBooksModal.style.display = "flex";
  }

  function closeCompletedBooksModal() {
    completedBooksModal.style.display = "none";
  }

  function loadCompletedBooks() {
    const completedTasks = tasks.filter(
      (task) => task.currentStage === "completed"
    );
    completedBooksTbody.innerHTML = "";
    completedCount.textContent = completedTasks.length;

    if (completedTasks.length === 0) {
      completedBooksTbody.innerHTML =
        '<tr><td colspan="4" style="text-align: center; color: #666; padding: 20px;">완료된 도서가 없습니다.</td></tr>';
      return;
    }

    // 완료일 기준으로 최신순 정렬
    completedTasks.sort((a, b) => {
      const aDate = getCompletionDate(a);
      const bDate = getCompletionDate(b);

      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;

      try {
        const aDateObj = new Date(aDate);
        const bDateObj = new Date(bDate);
        return bDateObj - aDateObj; // 최신순
      } catch (e) {
        return 0;
      }
    });

    completedTasks.forEach((task) => {
      const row = document.createElement("tr");
      const completionDate = getCompletionDate(task);

      // 완료일 포맷팅 (날짜 부분만 표시)
      let formattedDate = "완료일 불명";
      if (completionDate) {
        // "2025. 8. 15. 오후 3:30:00" -> "2025. 8. 15."
        const dateParts = completionDate.split(" ");
        if (dateParts.length >= 3) {
          formattedDate = `${dateParts[0]} ${dateParts[1]} ${dateParts[2]}`;
        }
      }

      row.innerHTML = `
                <td class="task-clickable-completed" data-task-id="${
                  task.id
                }">${stripHtmlTags(task.book.title) || "제목 없음"}</td>
                <td>${stripHtmlTags(task.book.author) || "저자 없음"}</td>
                <td>${task.totalPages || 0}</td>
                <td>${formattedDate}</td>
            `;
      completedBooksTbody.appendChild(row);
    });

    // 완료된 도서 제목 클릭 시 작업 히스토리 보기
    document.querySelectorAll(".task-clickable-completed").forEach((cell) => {
      cell.addEventListener("click", (e) => {
        const taskId = e.target.dataset.taskId;
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          closeCompletedBooksModal();
          showTaskHistory(task);
        }
      });
    });
  }

  function getCompletionDate(task) {
    // 완료된 작업의 경우 마지막으로 완료된 단계의 날짜를 반환
    if (task.currentStage !== "completed") {
      return null;
    }

    let latestDate = null;

    // 단계 순서대로 확인하여 실제로 완료된 마지막 단계의 날짜 찾기
    const stageOrder = [
      "correction1",
      "correction2",
      "correction3",
      "transcription",
    ];

    // 뒤에서부터 확인하여 완료된 마지막 단계 찾기
    for (let i = stageOrder.length - 1; i >= 0; i--) {
      const stageKey = stageOrder[i];
      const stage = task.stages && task.stages[stageKey];

      if (
        stage &&
        stage.status === "completed" &&
        stage.history &&
        stage.history.length > 0
      ) {
        // 해당 단계에서 총 페이지를 완료한 기록 찾기
        for (let j = stage.history.length - 1; j >= 0; j--) {
          const entry = stage.history[j];
          if (entry.endPage === task.totalPages) {
            return entry.date;
          }
        }
        // 마지막 기록이 완료 기록이라고 가정
        const lastEntry = stage.history[stage.history.length - 1];
        if (lastEntry.date) {
          return lastEntry.date;
        }
      }
    }

    // 위 방법으로 찾지 못한 경우 모든 단계에서 가장 최신 날짜 반환
    if (task.stages) {
      Object.values(task.stages).forEach((stage) => {
        if (stage.history && stage.history.length > 0) {
          const lastEntry = stage.history[stage.history.length - 1];
          if (lastEntry.date) {
            if (
              !latestDate ||
              new Date(lastEntry.date) > new Date(latestDate)
            ) {
              latestDate = lastEntry.date;
            }
          }
        }
      });
    }

    return latestDate;
  }

  function cleanText(text) {
    if (!text) return "";
    // HTML 태그 제거 및 텍스트 정리
    return stripHtmlTags(text.toString()).replace(/"/g, '""').trim();
  }

  function exportCompletedBooks() {
    const completedTasks = tasks.filter(
      (task) => task.currentStage === "completed"
    );

    if (completedTasks.length === 0) {
      alert("내보낼 완료된 도서가 없습니다.");
      return;
    }

    const csvData = [
      [
        "제목",
        "저자",
        "출판사",
        "ISBN",
        "총페이지",
        "1차교정담당자",
        "2차교정담당자",
        "3차교정담당자",
        "점역담당자",
        "완료일",
      ].join(","),
      ...completedTasks.map((task) => {
        const completionDate = getCompletionDate(task);
        let formattedDate = "완료일 불명";

        if (completionDate) {
          // "2025. 8. 15. 오후 3:30:00" 형식에서 날짜 부분만 추출
          const dateParts = completionDate.split(" ");
          if (dateParts.length >= 3) {
            formattedDate = `${dateParts[0]} ${dateParts[1]} ${dateParts[2]}`;
          } else {
            // 다른 형식의 날짜인 경우 Date 객체로 변환 시도
            try {
              const dateObj = new Date(completionDate);
              formattedDate = dateObj.toLocaleDateString("ko-KR");
            } catch (e) {
              formattedDate = completionDate; // 원본 그대로 사용
            }
          }
        }

        return [
          `"${cleanText(task.book.title)}"`,
          `"${cleanText(task.book.author)}"`,
          `"${cleanText(task.book.publisher)}"`,
          `"${cleanText(task.book.isbn)}"`,
          task.totalPages || 0,
          `"${cleanText(task.stages?.correction1?.assignedTo) || "미정"}"`,
          `"${cleanText(task.stages?.correction2?.assignedTo) || "미정"}"`,
          `"${cleanText(task.stages?.correction3?.assignedTo) || "미정"}"`,
          `"${cleanText(task.stages?.transcription?.assignedTo) || "미정"}"`,
          `"${formattedDate}"`,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvData], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `completed_books_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert("완료된 도서 목록이 CSV 파일로 내보내졌습니다.");
  }

  function exportInProgressBooks() {
    const inProgressTasks = tasks.filter(
      (task) => task.currentStage !== "completed"
    );

    if (inProgressTasks.length === 0) {
      alert("내보낼 진행 중인 도서가 없습니다.");
      return;
    }

    // 진행률 계산 함수
    function getProgressInfo(task) {
      const progress = calculateProgress(task);
      let currentPage = 0;

      if (task.currentStage && task.stages && task.stages[task.currentStage]) {
        const stage = task.stages[task.currentStage];
        if (stage.history && stage.history.length > 0) {
          currentPage = stage.history[stage.history.length - 1].endPage || 0;
        }
      }

      return { progress, currentPage };
    }

    function getStageName(stageKey) {
      const stageNames = {
        correction1: "1차 교정",
        correction2: "2차 교정",
        correction3: "3차 교정",
        transcription: "점역",
      };
      return stageNames[stageKey] || stageKey;
    }

    function getCurrentAssignee(task) {
      if (
        !task.currentStage ||
        !task.stages ||
        !task.stages[task.currentStage]
      ) {
        return "미정";
      }
      return cleanText(task.stages[task.currentStage].assignedTo) || "미정";
    }

    const csvData = [
      [
        "제목",
        "저자",
        "출판사",
        "ISBN",
        "총페이지",
        "현재단계",
        "현재담당자",
        "1차교정담당자",
        "2차교정담당자",
        "3차교정담당자",
        "점역담당자",
        "진행페이지",
        "진행률",
      ].join(","),
      ...inProgressTasks.map((task) => {
        const progressInfo = getProgressInfo(task);
        return [
          `"${cleanText(task.book.title)}"`,
          `"${cleanText(task.book.author)}"`,
          `"${cleanText(task.book.publisher)}"`,
          `"${cleanText(task.book.isbn)}"`,
          task.totalPages || 0,
          getStageName(task.currentStage),
          `"${getCurrentAssignee(task)}"`,
          `"${cleanText(task.stages?.correction1?.assignedTo) || "미정"}"`,
          `"${cleanText(task.stages?.correction2?.assignedTo) || "미정"}"`,
          `"${cleanText(task.stages?.correction3?.assignedTo) || "미정"}"`,
          `"${cleanText(task.stages?.transcription?.assignedTo) || "미정"}"`,
          `${progressInfo.currentPage}/${task.totalPages || 0}`,
          `${progressInfo.progress}%`,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvData], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `in_progress_books_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert("진행 중인 도서 목록이 CSV 파일로 내보내졌습니다.");
  }

  // 검색 기능
  completedSearch.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = completedBooksTbody.querySelectorAll("tr");

    rows.forEach((row) => {
      const title = row.cells[0]?.textContent.toLowerCase() || "";
      const author = row.cells[1]?.textContent.toLowerCase() || "";

      if (title.includes(searchTerm) || author.includes(searchTerm)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });

  // 완료된 도서 모달 이벤트 리스너들
  completedBooksCloseButton.addEventListener("click", closeCompletedBooksModal);
  exportCompletedBtn.addEventListener("click", exportCompletedBooks);
  exportInProgressBtn.addEventListener("click", exportInProgressBooks);

  // 비밀번호 모달 이벤트 리스너들
  passwordForm.addEventListener("submit", handlePasswordSubmit);
  passwordCancelBtn.addEventListener("click", closePasswordModal);
  passwordModalCloseButton.addEventListener("click", closePasswordModal);

  // 담당자 지정 모달 이벤트 리스너들
  assignCorrectorForm.addEventListener("submit", handleAssignCorrectorSubmit);
  assignCancelBtn.addEventListener("click", closeAssignCorrectorModal);
  assignModalCloseButton.addEventListener("click", closeAssignCorrectorModal);

  // 출퇴근 기록 이벤트 리스너들 - 서버 데이터 사용
  let currentAdminAttendanceData = null;

  async function refreshAdminAttendanceTable() {
    if (currentAdminAttendanceData) {
      renderAttendanceTableForModalWithData(
        "attendance",
        currentAdminAttendanceData
      );
    } else {
      // 데이터가 없으면 새로고침
      await loadAttendanceData();
    }
  }

  async function exportAdminAttendanceRecords() {
    try {
      // 서버에서 최신 출석부 데이터 로드
      const response = await fetch(ATTENDANCE_DATA_API_URL);
      if (response.ok) {
        const serverWorkSessions = await response.json();
        console.log(
          "Exporting admin attendance data from server:",
          serverWorkSessions.length,
          "sessions"
        );

        // 서버 데이터로 내보내기
        exportAttendanceRecordsForModalWithData(
          "attendance",
          serverWorkSessions
        );
      } else {
        console.error("Failed to load attendance data from server for export");
        // 폴백으로 기존 방식 사용
        exportAttendanceRecordsForModal("attendance");
      }
    } catch (error) {
      console.error(
        "Error exporting admin attendance data from server:",
        error
      );
      // 폴백으로 기존 방식 사용
      exportAttendanceRecordsForModal("attendance");
    }
  }

  document
    .getElementById("attendance-year")
    ?.addEventListener("change", refreshAdminAttendanceTable);
  document
    .getElementById("attendance-month")
    ?.addEventListener("change", refreshAdminAttendanceTable);
  document
    .getElementById("attendance-date")
    ?.addEventListener("change", refreshAdminAttendanceTable);
  document
    .getElementById("attendance-worker")
    ?.addEventListener("change", refreshAdminAttendanceTable);
  document
    .getElementById("refresh-attendance-btn")
    ?.addEventListener("click", loadAttendanceData);
  document
    .getElementById("export-attendance-btn")
    ?.addEventListener("click", exportAdminAttendanceRecords);

  document
    .getElementById("create-attendance-btn")
    ?.addEventListener("click", () => {
      openAttendanceEditModal();
    });

  // Event delegation for edit and delete buttons
  document
    .getElementById("attendance-tbody")
    .addEventListener("click", (event) => {
      if (event.target.classList.contains("edit-attendance-btn")) {
        const recordId = event.target.dataset.id;
        const record = findAttendanceRecordById(recordId);
        if (record) {
          openAttendanceEditModal(record);
        }
      } else if (event.target.classList.contains("delete-attendance-btn")) {
        const recordId = event.target.dataset.id;
        if (confirm("정말로 이 출퇴근 기록을 삭제하시겠습니까?")) {
          deleteAttendanceRecord(recordId);
        }
      }
    });

  // Handle form submission for attendance edit modal
  document
    .getElementById("attendance-edit-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      saveAttendanceRecord();
    });

  // Close modal
  document
    .querySelector("#attendance-edit-modal .close-button")
    .addEventListener("click", () => {
      closeAttendanceEditModal();
    });

  function openAttendanceEditModal(record = null) {
    const modal = document.getElementById("attendance-edit-modal");
    const title = document.getElementById("attendance-edit-modal-title");
    const form = document.getElementById("attendance-edit-form");
    const workerSelect = document.getElementById("attendance-edit-worker");

    // Populate worker select
    workerSelect.innerHTML = "";
    staff.forEach((s) => {
      const option = document.createElement("option");
      option.value = s.name;
      option.textContent = s.name;
      workerSelect.appendChild(option);
    });

    if (record) {
      title.textContent = "출퇴근 기록 수정";
      document.getElementById("attendance-edit-id").value = record.id;
      workerSelect.value = record.worker;
      document.getElementById("attendance-edit-date").value = new Date(
        record.startTime
      )
        .toISOString()
        .split("T")[0];
      document.getElementById("attendance-edit-start-time").value = new Date(
        record.startTime
      )
        .toLocaleTimeString("sv-SE")
        .substring(0, 5);
      document.getElementById("attendance-edit-end-time").value = new Date(
        record.endTime
      )
        .toLocaleTimeString("sv-SE")
        .substring(0, 5);
      document.getElementById("attendance-edit-pages").value =
        record.pagesWorked ?? "";
      document.getElementById("attendance-edit-tasks").value =
        record.taskTitle || "";
    } else {
      title.textContent = "출퇴근 기록 생성";
      form.reset();
      document.getElementById("attendance-edit-id").value = "";
      document.getElementById("attendance-edit-pages").value = "";
    }

    modal.style.display = "flex";
  }

  function closeAttendanceEditModal() {
    const modal = document.getElementById("attendance-edit-modal");
    modal.style.display = "none";
  }

  function findAttendanceRecordById(recordId) {
    if (!currentAdminAttendanceData) return null;
    return currentAdminAttendanceData.find((record) => record.id === recordId);
  }

  async function saveAttendanceRecord() {
    const id = document.getElementById("attendance-edit-id").value;
    const worker = document.getElementById("attendance-edit-worker").value;
    const date = document.getElementById("attendance-edit-date").value;
    const startTime = document.getElementById(
      "attendance-edit-start-time"
    ).value;
    const endTime = document.getElementById("attendance-edit-end-time").value;
    const pagesInput = document.getElementById("attendance-edit-pages").value;
    const rawTasksInput = document.getElementById(
      "attendance-edit-tasks"
    ).value;

    let pagesWorked = parseInt(pagesInput, 10);
    if (isNaN(pagesWorked) || pagesWorked < 0) {
      pagesWorked = 0;
    }

    const tasks = rawTasksInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const record = {
      worker,
      startTime: new Date(`${date}T${startTime}`).toISOString(),
      endTime: new Date(`${date}T${endTime}`).toISOString(),
      taskTitle: tasks.join(", "),
      pagesWorked,
    };

    try {
      if (id) {
        await FirebaseWorkSessionsHistory.update(id, record);
      } else {
        await FirebaseWorkSessionsHistory.create(record);
      }

      closeAttendanceEditModal();
      loadAttendanceData();
    } catch (error) {
      console.error("Error saving attendance record:", error);
      alert("출퇴근 기록 저장에 실패했습니다.");
    }
  }

  async function deleteAttendanceRecord(recordId) {
    try {
      await FirebaseWorkSessionsHistory.delete(recordId);
      loadAttendanceData();
    } catch (error) {
      console.error("Error deleting attendance record:", error);
      alert("출퇴근 기록 삭제에 실패했습니다.");
    }
  }

  // 직원 관리 이벤트 리스너들
  const staffForm = document.getElementById("staff-form");
  if (staffForm) {
    staffForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("staff-name");
      const roleSelect = document.getElementById("staff-role");

      const name = nameInput.value.trim();
      const role = roleSelect.value;

      if (!name) {
        alert("직원 이름을 입력해주세요.");
        return;
      }

      try {
        isStaffOperationInProgress = true; // 직원 작업 시작

        if (currentEditingStaff) {
          // 편집 모드: 기존 직원 정보 업데이트
          // 중복 이름 체크 (자기 자신 제외)
          if (
            staff.some((s) => s.name === name && s.id !== currentEditingStaff)
          ) {
            alert("이미 등록된 직원입니다.");
            isStaffOperationInProgress = false; // 작업 종료
            return;
          }

          await updateStaff(currentEditingStaff, name, role);
          exitEditMode();
          alert("직원 정보가 성공적으로 수정되었습니다.");
          // alert 후 관리자 패널과 직원 탭 유지
          setTimeout(() => {
            adminPanelModal.style.display = "flex";
            switchTab("staff");
            isStaffOperationInProgress = false; // 작업 완료
          }, 100);
        } else {
          // 새로 추가 모드
          // 중복 이름 체크
          if (staff.some((s) => s.name === name)) {
            alert("이미 등록된 직원입니다.");
            isStaffOperationInProgress = false; // 작업 종료
            return;
          }

          await addStaff(name, role);
          nameInput.value = "";
          roleSelect.value = "corrector";
          alert("직원이 성공적으로 등록되었습니다.");
          // alert 후 관리자 패널과 직원 탭 유지
          setTimeout(() => {
            adminPanelModal.style.display = "flex";
            switchTab("staff");
            isStaffOperationInProgress = false; // 작업 완료
          }, 100);
        }
      } catch (error) {
        alert(
          currentEditingStaff
            ? "직원 수정에 실패했습니다: " + error.message
            : "직원 등록에 실패했습니다: " + error.message
        );
        // 오류 시에도 관리자 패널과 직원 탭 유지
        setTimeout(() => {
          adminPanelModal.style.display = "flex";
          switchTab("staff");
          isStaffOperationInProgress = false; // 작업 완료
        }, 100);
      }
    });
  }

  // Work Session Management Functions
  async function startWorkSession(task, worker) {
    try {
      // 새로운 세션 시작 플래그 설정
      isStartingNewSession = true;

      // 진행상황 모달 보호 플래그 해제 (작업 시작 시에는 모달이 열리면 안됨)
      isProgressModalProtected = false;

      // 진행상황 모달이 열려있다면 닫기 (작업 시작 시에는 모달이 열리면 안됨)
      const progressModal = document.getElementById("progress-update-modal");
      if (progressModal && progressModal.style.display === "flex") {
        progressModal.style.display = "none";
      }

      // API 호출로 작업 세션 시작
      const response = await fetch(WORK_SESSIONS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: task.id,
          worker: worker,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newSession = await response.json();
      console.log(`Work session started for ${worker} on task ${task.id}`);

      // 플래그 해제 (약간의 지연 후)
      setTimeout(() => {
        isStartingNewSession = false;
      }, 1000);

      // 로컬 처리는 WebSocket 메시지로 받을 때 처리됨
    } catch (error) {
      console.error("작업 세션 시작 실패:", error);
      alert("작업 세션 시작에 실패했습니다: " + error.message);
      isStartingNewSession = false; // 에러 시에도 플래그 해제
    }
  }

  async function stopWorkSession(task, worker, showProgressModal = true) {
    console.log(
      `🛑 stopWorkSession 호출 - task: ${task.id}, worker: ${worker}`
    );
    console.log(`📋 Task 정보:`, {
      id: task.id,
      title: task.book?.title,
      currentStage: task.currentStage,
      stages: task.stages,
      hasStages: !!task.stages,
      stageKeys: task.stages ? Object.keys(task.stages) : [],
    });

    if (showProgressModal) {
      // stage 안전하게 가져오기
      const stage = task.stages && task.stages[task.currentStage];

      if (!stage) {
        console.error(
          `❌ Stage not found: currentStage=${task.currentStage}`,
          task
        );
        alert(
          `작업 단계 정보를 찾을 수 없습니다. (단계: ${task.currentStage})\n\n관리자에게 문의하세요.`
        );
        return;
      }

      const lastCompletedPage =
        stage.history && stage.history.length > 0
          ? stage.history[stage.history.length - 1].endPage
          : 0;

      // Store session info to be used when progress is submitted
      window.currentStoppedSession = {
        taskId: task.id,
        worker: worker,
        startPage: lastCompletedPage,
        startTime: null, // 나중에 업데이트
        taskTitle: task.book ? task.book.title : "Unknown",
        stage: task.currentStage || "unknown",
      };

      console.log(`📤 Firebase에서 세션 제거 시작 - task: ${task.id}`);

      // 즉시 Firebase에서 세션 제거 (다른 사용자 화면에도 즉시 반영)
      // 세션 정보를 미리 가져오기
      let sessionInfo = null;
      try {
        sessionInfo = await FirebaseWorkSessions.removeSession(task.id);
        console.log(
          `✅ Firebase에서 세션 제거 완료 - task: ${task.id}`,
          sessionInfo
        );

        // 세션 정보 업데이트
        if (sessionInfo) {
          window.currentStoppedSession.startTime = sessionInfo.startTime;
        } else {
          window.currentStoppedSession.startTime = new Date().toISOString();
        }

        // 로컬 currentWorkSessions에서도 즉시 제거 (자신의 UI 즉시 업데이트)
        currentWorkSessions.delete(task.id);
        console.log(
          `🗑️ 로컬 currentWorkSessions에서 제거됨 - task: ${task.id}`
        );

        // 로컬 UI 즉시 업데이트 (자신의 화면)
        renderTasks();
        updateCurrentWorkersDisplay();
        console.log(`🔄 로컬 UI 업데이트 완료`);
      } catch (error) {
        console.error("❌ Firebase 세션 제거 실패:", error);
        window.currentStoppedSession.startTime = new Date().toISOString();
      }

      // 진행상황 모달 보호 플래그 설정 (이제 Firebase 업데이트가 완료되었으므로)
      isProgressModalProtected = true;

      // tasks 배열에서 최신 task 가져오기 (데이터 복구가 적용된 최신 버전)
      const latestTask = tasks.find((t) => t.id === task.id);
      if (!latestTask) {
        console.error(`❌ Task not found in tasks array: ${task.id}`);
        alert("작업 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.");
        return;
      }

      // Open progress modal (최신 task 사용)
      openProgressUpdateModal(latestTask);
    } else {
      console.warn(
        "stopWorkSession called without showing progress modal. This is not fully handled."
      );
    }
  }

  // 서버에서 현재 작업 세션 로드
  // DEPRECATED: Duplicate function removed - using the one at line ~4748

  // DEPRECATED: 로컬스토리지 기반 출퇴근 기록 저장 - 이제 서버 기반으로 대체됨
  function saveWorkSessionsToStorage() {
    console.warn(
      "saveWorkSessionsToStorage is deprecated. Use server-based attendance data storage instead."
    );
    // 기능 비활성화됨 - 서버 기반 시스템 사용
  }

  // 작업 개수 업데이트 함수
  function updateTaskCounts() {
    if (!completedCount) return;

    // 완료된 작업 개수 계산
    const completedTasks = tasks.filter((task) => {
      if (!task.stages) return false;

      const stages = [
        "correction1",
        "correction2",
        "correction3",
        "transcription",
      ];
      return stages.every((stage) => {
        if (!task.stages[stage]) return true;
        return (
          task.stages[stage].status === "completed" ||
          task.stages[stage].status === "not_applicable"
        );
      });
    });

    completedCount.textContent = completedTasks.length;
  }

  // 실시간 작업자 표시 업데이트 시작
  function startWorkersDisplayUpdate() {
    // 기존 타이머가 있으면 정리
    if (workersDisplayInterval) {
      clearInterval(workersDisplayInterval);
      workersDisplayInterval = null;
    }

    // 작업중인 세션이 있을 때만 타이머 시작
    if (currentWorkSessions.size > 0) {
      // 30초마다 화면 업데이트 (작업시간 표시 갱신)
      workersDisplayInterval = setInterval(() => {
        if (currentUser && mainDashboard.style.display !== "none") {
          updateCurrentWorkersDisplay();
        } else {
          // 로그아웃 상태면 타이머 정리
          stopWorkersDisplayUpdate();
        }
      }, 30000); // 30초마다
    }
  }

  // 실시간 작업자 표시 업데이트 중지
  function stopWorkersDisplayUpdate() {
    if (workersDisplayInterval) {
      clearInterval(workersDisplayInterval);
      workersDisplayInterval = null;
    }
  }

  function updateCurrentWorkersDisplay() {
    // 로그인되지 않은 상태에서는 실행하지 않음
    if (!currentUser || mainDashboard.style.display === "none") {
      stopWorkersDisplayUpdate();
      return;
    }

    let currentWorkersDiv = document.getElementById("current-workers-display");
    if (!currentWorkersDiv) {
      // Create the display element
      const headerContent = document.querySelector(".header-content");

      currentWorkersDiv = document.createElement("div");
      currentWorkersDiv.id = "current-workers-display";
      currentWorkersDiv.style.cssText = `
        background: #e8f5e8;
        border: 1px solid #4CAF50;
        border-radius: 8px;
        margin: 20px auto;
        padding: 15px;
        font-size: 0.9em;
        max-width: 1200px;
        text-align: center;
      `;

      // 더 안전한 방법으로 요소 추가 - 메인 섹션에 추가하도록 수정
      const searchSection = document.querySelector(".search-section");
      if (searchSection) {
        // search-section 다음에 추가
        searchSection.parentNode.insertBefore(
          currentWorkersDiv,
          searchSection.nextSibling
        );
      } else {
        // search-section이 없으면 main 시작 부분에 추가
        const main = document.querySelector("main");
        if (main) {
          main.insertBefore(currentWorkersDiv, main.firstChild);
        } else {
          console.warn(
            "Main element not found, skipping current workers display"
          );
          return;
        }
      }

      // Add click handler for debugging
      currentWorkersDiv.addEventListener("click", () => {
        console.log("Current work sessions debug:", {
          size: currentWorkSessions.size,
          entries: Array.from(currentWorkSessions.entries()),
          raw: currentWorkSessions,
        });
      });
    }

    if (currentWorkSessions.size === 0) {
      currentWorkersDiv.innerHTML =
        '<div style="text-align: center; color: #666;">현재 작업 중인 담당자가 없습니다.</div>';
      // 작업중인 세션이 없으면 타이머 정리
      stopWorkersDisplayUpdate();
      return;
    }

    const workersHtml = Array.from(currentWorkSessions.entries())
      .map(([taskId, session]) => {
        const duration = Math.round(
          (new Date() - session.startTime) / 1000 / 60
        );
        const stageNames = {
          correction1: "1차 교정",
          correction2: "2차 교정",
          correction3: "3차 교정",
          finalCorrection: "최종검수",
          transcription: "점역",
        };
        const stageName = stageNames[session.stage] || session.stage;

        const workerName = session.worker || "Unknown";

        return `
        <div style="display: inline-block; background: white; padding: 5px 10px; margin: 2px; border-radius: 20px; border: 1px solid #4CAF50; color: #333;">
          <strong style="color: #2e7d32;">${workerName}</strong> - ${stageName} (작업시간: ${duration}분)
        </div>
      `;
      })
      .join("");

    currentWorkersDiv.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">현재 작업 중 (${currentWorkSessions.size}명)</div>
      <div>${workersHtml}</div>
    `;
  }

  // Attendance Management Functions
  function calculateAttendanceRecords(sessionsData = []) {
    const records = [];
    sessionsData.forEach((session) => {
      if (!session.startTime || !session.endTime) return;

      records.push({
        id: session.id, // Assuming session has an id
        worker: session.worker,
        date: new Date(session.startTime).toDateString(),
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime),
        tasks: [session.taskTitle],
        pagesWorked: session.pagesWorked || 0,
      });
    });
    return records;
  }

  async function loadAttendanceData() {
    try {
      // Firebase에서 출석부 데이터 로드
      const serverWorkSessions = await FirebaseWorkSessionsHistory.getAll();
      console.log(
        "Loaded attendance data from Firebase for admin modal:",
        serverWorkSessions.length,
        "sessions"
      );

      // 현재 관리자 데이터 캐시
      currentAdminAttendanceData = serverWorkSessions;

      // Firebase 데이터로 출석부 데이터 로드
      loadAttendanceDataForModalWithData("attendance", serverWorkSessions);
    } catch (error) {
      console.error("Error loading attendance data from Firebase:", error);
      // 빈 배열로 초기화하여 UI 표시
      currentAdminAttendanceData = [];
      loadAttendanceDataForModalWithData("attendance", []);
    }
  }

  // Load work sessions on startup - 이제 서버 기반으로 처리됨

  // Update current workers display periodically
  setInterval(updateCurrentWorkersDisplay, 60000); // Update every minute

  // Staff editing functionality
  let currentEditingStaff = null;

  async function updateStaff(staffId, name, role) {
    try {
      const response = await fetch(`${STAFF_API_URL}/${staffId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, role }),
      });

      if (response.ok) {
        const updatedStaff = await response.json();
        // Update staff array
        const index = staff.findIndex((s) => s.id === staffId);
        if (index !== -1) {
          staff[index] = updatedStaff;
        }
        updateStaffDropdowns();
        updateAssignCorrectorDropdownIfOpen();

        // 항상 직원 리스트 렌더링
        renderStaffList();
        // 직원 탭 강제 유지
        switchTab("staff");
        return updatedStaff;
      } else {
        throw new Error("Failed to update staff member");
      }
    } catch (error) {
      console.error("Error updating staff:", error);
      throw error;
    }
  }

  function enterEditMode(staffId) {
    const staffMember = staff.find((s) => s.id === staffId);
    if (!staffMember) return;

    currentEditingStaff = staffId;

    // Find the staff form elements
    const nameInput = document.getElementById("staff-name");
    const roleSelect = document.getElementById("staff-role");
    const submitBtn = document.querySelector(
      '#staff-form button[type="submit"]'
    );

    if (nameInput && roleSelect && submitBtn) {
      // Fill form with current staff data
      nameInput.value = staffMember.name;
      roleSelect.value = staffMember.role;

      // Change button text to indicate editing mode
      submitBtn.textContent = "수정 완료";

      // Scroll to form
      nameInput.scrollIntoView({ behavior: "smooth" });
      nameInput.focus();

      // Add visual indicator
      const form = document.getElementById("staff-form");
      form.classList.add("editing");

      // Add cancel button if it doesn't exist
      let cancelBtn = document.getElementById("edit-cancel-btn");
      if (!cancelBtn) {
        cancelBtn = document.createElement("button");
        cancelBtn.id = "edit-cancel-btn";
        cancelBtn.type = "button";
        cancelBtn.className = "small-btn cancel-btn";
        cancelBtn.textContent = "취소";
        cancelBtn.style.marginLeft = "10px";
        cancelBtn.onclick = exitEditMode;
        submitBtn.parentNode.appendChild(cancelBtn);
      }
      cancelBtn.style.display = "inline-block";
    }
  }

  function exitEditMode() {
    currentEditingStaff = null;

    // Reset form
    const nameInput = document.getElementById("staff-name");
    const roleSelect = document.getElementById("staff-role");
    const submitBtn = document.querySelector(
      '#staff-form button[type="submit"]'
    );
    const cancelBtn = document.getElementById("edit-cancel-btn");

    if (nameInput && roleSelect && submitBtn) {
      nameInput.value = "";
      roleSelect.value = "corrector";
      submitBtn.textContent = "등록";

      // Remove visual indicators
      const form = document.getElementById("staff-form");
      form.classList.remove("editing");

      // Hide cancel button
      if (cancelBtn) {
        cancelBtn.style.display = "none";
      }
    }
  }

  // 서버 데이터를 직접 사용하는 출석부 데이터 로드 함수들
  function loadAttendanceDataForModalWithData(prefix, sessionsData) {
    const attendanceYear = document.getElementById(`${prefix}-year`);
    const attendanceMonth = document.getElementById(`${prefix}-month`);
    const attendanceWorker = document.getElementById(`${prefix}-worker`);

    // Populate year dropdown with available years from server data
    populateYearDropdownForModalWithData(prefix, sessionsData);

    // Set current date as default if no selection
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0");

    if (attendanceYear && !attendanceYear.value) {
      attendanceYear.value = currentYear;
    }
    if (attendanceMonth && !attendanceMonth.value) {
      attendanceMonth.value = currentMonth;
    }

    // Populate worker dropdown from server data
    attendanceWorker.innerHTML = '<option value="">모든 직원</option>';
    const uniqueWorkers = [
      ...new Set(sessionsData.map((s) => s.worker)),
    ].filter((w) => w);
    uniqueWorkers.forEach((worker) => {
      const option = document.createElement("option");
      option.value = worker;
      option.textContent = worker;
      attendanceWorker.appendChild(option);
    });

    // "attendance-only" prefix일 때만 summary 렌더링 (출퇴근 기록 확인 모달)
    if (prefix === "attendance-only") {
      renderAttendanceSummaryForModalWithData(prefix, sessionsData);
    }
    renderAttendanceTableForModalWithData(prefix, sessionsData);
  }

  function populateYearDropdownForModalWithData(prefix, sessionsData) {
    const attendanceYear = document.getElementById(`${prefix}-year`);
    if (!attendanceYear) return;

    // Get unique years from sessions data
    const years = new Set();
    sessionsData.forEach((session) => {
      if (session.startTime) {
        const year = new Date(session.startTime).getFullYear();
        years.add(year);
      }
    });

    // Add current year even if no sessions
    years.add(new Date().getFullYear());

    // Clear and populate year dropdown
    attendanceYear.innerHTML = '<option value="">전체 연도</option>';

    // Sort years in descending order
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    sortedYears.forEach((year) => {
      const option = document.createElement("option");
      option.value = year.toString();
      option.textContent = `${year}년`;
      attendanceYear.appendChild(option);
    });
  }

  function renderAttendanceSummaryForModalWithData(prefix, sessionsData) {
    const today = new Date().toDateString();
    const attendanceRecords = calculateAttendanceRecords(sessionsData);
    const summaryContent = document.getElementById(`${prefix}-summary-content`);

    let todayWorkers = [];
    attendanceRecords.forEach((workerDays, worker) => {
      if (workerDays.has(today)) {
        const todayRecord = workerDays.get(today);
        const workTime = Math.round(
          (todayRecord.endTime - todayRecord.startTime) / 1000 / 60
        ); // minutes
        todayWorkers.push({
          worker,
          startTime: todayRecord.startTime,
          endTime: todayRecord.endTime,
          workTime,
          tasks: todayRecord.tasks,
        });
      }
    });

    if (todayWorkers.length === 0) {
      summaryContent.innerHTML =
        '<p style="text-align: center; color: #666; padding: 20px;">오늘 출근한 직원이 없습니다.</p>';
      return;
    }

    // Sort by start time
    todayWorkers.sort((a, b) => a.startTime - b.startTime);

    const summaryHtml = todayWorkers
      .map((record) => {
        const tasksHtml =
          record.tasks.length > 0
            ? `<div style="font-size: 0.9em; color: #666; margin-top: 5px;">작업: ${record.tasks.join(
                ", "
              )}</div>`
            : "";

        return `
        <div class="attendance-summary-item">
          <strong>${record.worker}</strong> - 
          출근: ${record.startTime.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}, 
          퇴근: ${record.endTime.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}, 
          근무시간: ${Math.floor(record.workTime / 60)}시간 ${
          record.workTime % 60
        }분
          ${tasksHtml}
        </div>
      `;
      })
      .join("");

    summaryContent.innerHTML = `
      <h4>오늘의 출근 현황 (${todayWorkers.length}명)</h4>
      ${summaryHtml}
    `;
  }

  function renderAttendanceTableForModalWithData(prefix, sessionsData) {
    const attendanceYear = document.getElementById(`${prefix}-year`);
    const attendanceMonth = document.getElementById(`${prefix}-month`);
    const attendanceDate = document.getElementById(`${prefix}-date`);
    const attendanceWorker = document.getElementById(`${prefix}-worker`);
    const attendanceTbody = document.getElementById(`${prefix}-tbody`);

    const selectedYear = attendanceYear?.value;
    const selectedMonth = attendanceMonth?.value;
    const selectedDate = attendanceDate?.value;
    const selectedWorker = attendanceWorker?.value;

    let tableData = calculateAttendanceRecords(sessionsData);

    // Apply filters
    if (selectedYear) {
      tableData = tableData.filter(
        (record) => record.startTime.getFullYear().toString() === selectedYear
      );
    }
    if (selectedMonth) {
      tableData = tableData.filter(
        (record) =>
          (record.startTime.getMonth() + 1).toString().padStart(2, "0") ===
          selectedMonth
      );
    }
    if (selectedDate) {
      tableData = tableData.filter(
        (record) =>
          record.startTime.getDate().toString().padStart(2, "0") ===
          selectedDate
      );
    }
    if (selectedWorker) {
      tableData = tableData.filter(
        (record) => record.worker === selectedWorker
      );
    }

    if (tableData.length === 0) {
      attendanceTbody.innerHTML =
        '<tr><td colspan="8" style="text-align: center; color: #666; padding: 20px;">출근 기록이 없습니다.</td></tr>';
      return;
    }

    // Sort by date (newest first)
    tableData.sort((a, b) => b.startTime - a.startTime);

    const tableHtml = tableData
      .map((record) => {
        const tasksText = record.taskTitle || "-";
        const workTime = Math.round(
          (record.endTime - record.startTime) / 1000 / 60
        );

        return `
        <tr data-id="${record.id}">
          <td>${record.startTime.toLocaleDateString("ko-KR")}</td>
          <td>${record.worker}</td>
          <td>${record.startTime.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}</td>
          <td>${record.endTime.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}</td>
          <td>${Math.floor(workTime / 60)}시간 ${workTime % 60}분</td>
          <td>${record.pagesWorked}페이지</td>
          <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${tasksText}">${tasksText}</td>
          <td>
            <button class="action-btn edit-attendance-btn" data-id="${
              record.id
            }">수정</button>
            <button class="action-btn delete-attendance-btn" data-id="${
              record.id
            }">삭제</button>
          </td>
        </tr>
      `;
      })
      .join("");

    attendanceTbody.innerHTML = tableHtml;
  }

  // 출퇴근 기록 전용 모달 함수들 - 서버 데이터 직접 사용
  let currentAttendanceData = null;

  async function loadAttendanceOnlyData() {
    try {
      // 서버에서 최신 출석부 데이터 로드
      const response = await fetch(ATTENDANCE_DATA_API_URL);
      if (response.ok) {
        const serverWorkSessions = await response.json();
        console.log(
          "Loaded attendance data from server for modal:",
          serverWorkSessions.length,
          "sessions"
        );

        // 현재 데이터 캐시
        currentAttendanceData = serverWorkSessions;

        // 서버 데이터로 출석부 데이터 로드
        loadAttendanceDataForModalWithData(
          "attendance-only",
          serverWorkSessions
        );
      } else {
        console.error("Failed to load attendance data from server");
        // 빈 배열로 초기화
        currentAttendanceData = [];
        loadAttendanceDataForModalWithData("attendance-only", []);
      }
    } catch (error) {
      console.error("Error loading attendance data from server:", error);
      // 빈 배열로 초기화
      currentAttendanceData = [];
      loadAttendanceDataForModalWithData("attendance-only", []);
    }
  }

  async function refreshAttendanceOnlyTable() {
    if (currentAttendanceData) {
      renderAttendanceTableForModalWithData(
        "attendance-only",
        currentAttendanceData
      );
    } else {
      // 데이터가 없으면 새로고침
      await loadAttendanceOnlyData();
    }
  }

  async function exportAttendanceOnlyRecords() {
    try {
      // 서버에서 최신 출석부 데이터 로드
      const response = await fetch(ATTENDANCE_DATA_API_URL);
      if (response.ok) {
        const serverWorkSessions = await response.json();
        console.log(
          "Exporting attendance data from server:",
          serverWorkSessions.length,
          "sessions"
        );

        // 서버 데이터로 내보내기
        exportAttendanceRecordsForModalWithData(
          "attendance-only",
          serverWorkSessions
        );
      } else {
        console.error("Failed to load attendance data from server for export");
        alert("서버에서 출석부 데이터를 가져올 수 없습니다.");
      }
    } catch (error) {
      console.error("Error exporting attendance data from server:", error);
      alert("출석부 데이터 내보내기 중 오류가 발생했습니다.");
    }
  }

  function exportAttendanceRecordsForModalWithData(prefix, sessionsData) {
    const attendanceYear = document.getElementById(`${prefix}-year`);
    const attendanceMonth = document.getElementById(`${prefix}-month`);
    const attendanceDate = document.getElementById(`${prefix}-date`);
    const attendanceWorker = document.getElementById(`${prefix}-worker`);

    const selectedYear = attendanceYear?.value;
    const selectedMonth = attendanceMonth?.value;
    const selectedDate = attendanceDate?.value;
    const selectedWorker = attendanceWorker?.value;

    const attendanceRecords = calculateAttendanceRecords(sessionsData);
    const csvData = [];

    // Header
    csvData.push(
      [
        "날짜",
        "직원",
        "출근시간",
        "퇴근시간",
        "근무시간",
        "작업페이지수",
        "작업내용",
      ].join(",")
    );

    const exportData = [];
    attendanceRecords.forEach((workerDays, worker) => {
      if (selectedWorker && worker !== selectedWorker) return;

      workerDays.forEach((dayRecord, dateStr) => {
        const date = new Date(dateStr);
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");

        // Apply filters
        if (selectedYear && year !== selectedYear) return;
        if (selectedMonth && month !== selectedMonth) return;
        if (selectedDate && day !== selectedDate) return;

        const workTime = Math.round(
          (dayRecord.endTime - dayRecord.startTime) / 1000 / 60
        );
        const totalPages = dayRecord.workSessions.reduce((sum, session) => {
          return sum + (session.pagesWorked || 0);
        }, 0);

        exportData.push({
          date: date,
          worker: worker,
          startTime: dayRecord.startTime,
          endTime: dayRecord.endTime,
          workTime: workTime,
          totalPages: totalPages,
          tasks: dayRecord.tasks,
        });
      });
    });

    // Sort by date (newest first)
    exportData.sort((a, b) => b.date - a.date);

    exportData.forEach((record) => {
      const tasksText = record.tasks.length > 0 ? record.tasks.join("; ") : "";

      csvData.push(
        [
          record.date.toLocaleDateString("ko-KR"),
          record.worker,
          record.startTime.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          record.endTime.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          `${Math.floor(record.workTime / 60)}시간 ${record.workTime % 60}분`,
          record.totalPages,
          tasksText,
        ].join(",")
      );
    });

    const csvContent = csvData.join("\n");
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_records_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert("출근 기록이 CSV 파일로 내보내졌습니다.");
  }

  // 출퇴근 기록 전용 모달 이벤트 리스너들
  const attendanceOnlyModal = document.getElementById("attendance-only-modal");
  const attendanceCheckButton = document.getElementById(
    "attendance-check-button"
  );
  const attendanceOnlyCloseButton =
    attendanceOnlyModal?.querySelector(".close-button");

  if (attendanceCheckButton) {
    attendanceCheckButton.addEventListener("click", function () {
      // 현재 로그인된 사용자 정보 가져오기
      const currentUser = localStorage.getItem("currentUser");

      // 새 창에서 달력 페이지 열기
      const calendarUrl = `attendance-calendar.html${
        currentUser ? "?user=" + encodeURIComponent(currentUser) : ""
      }`;
      window.open(
        calendarUrl,
        "attendance-calendar",
        "width=1200,height=800,scrollbars=yes,resizable=yes"
      );
    });
  }

  // 출퇴근 기록 전용 모달 닫기 버튼 이벤트
  if (attendanceOnlyCloseButton) {
    attendanceOnlyCloseButton.addEventListener("click", function () {
      attendanceOnlyModal.style.display = "none";
    });
  }

  // 출퇴근 기록 전용 모달 내부 이벤트 리스너들 - 서버 데이터 사용
  document
    .getElementById("attendance-only-year")
    ?.addEventListener("change", refreshAttendanceOnlyTable);
  document
    .getElementById("attendance-only-month")
    ?.addEventListener("change", refreshAttendanceOnlyTable);
  document
    .getElementById("attendance-only-date")
    ?.addEventListener("change", refreshAttendanceOnlyTable);
  document
    .getElementById("attendance-only-worker")
    ?.addEventListener("change", refreshAttendanceOnlyTable);
  document
    .getElementById("refresh-attendance-only-btn")
    ?.addEventListener("click", loadAttendanceOnlyData);
  document
    .getElementById("export-attendance-only-btn")
    ?.addEventListener("click", exportAttendanceOnlyRecords);

  // 로그인 관련 함수들
  function checkLoginStatus() {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      currentUser = savedUser;
      showMainDashboard();
    } else {
      showLoginPage();
    }
  }

  function showLoginPage() {
    loginPage.style.display = "flex";
    mainDashboard.style.display = "none";
  }

  function showMainDashboard() {
    loginPage.style.display = "none";
    mainDashboard.style.display = "block";
    if (currentUserName && currentUser) {
      currentUserName.textContent = `${currentUser}님`;
    }

    // 관리자모드 버튼 권한 체크
    checkAdminButtonPermission();

    // Firebase 실시간 리스너 초기화 (실시간 데이터 동기화)
    initializeFirebaseListeners();

    // 초기 데이터 로드
    loadTasks();
    loadStaff();
    setTimeout(updateCurrentWorkersDisplay, 1000); // Show current workers after initial load
  }

  async function validateUser(name) {
    try {
      // Firebase에서 직원 목록을 가져와서 확인
      let staffList = await FirebaseStaff.getAll();

      if (!staffList || staffList.length === 0) {
        // Firebase에서 직원 목록을 가져올 수 없는 경우, 로컬 데이터 사용
        const savedStaff = localStorage.getItem("staff");
        if (savedStaff) {
          staffList = JSON.parse(savedStaff);
        } else {
          staffList = [];
        }
      }

      // 직원 목록에서 해당 이름이 있는지 확인
      return staffList.some((staff) => staff.name === name);
    } catch (error) {
      console.error("직원 검증 중 오류:", error);
      // 오류가 발생한 경우 로컬 데이터로 확인
      const savedStaff = localStorage.getItem("staff");
      if (savedStaff) {
        const staffList = JSON.parse(savedStaff);
        return staffList.some((staff) => staff.name === name);
      }
      return false;
    }
  }

  // 관리자모드 버튼 권한 체크
  function checkAdminButtonPermission() {
    const adminModeButton = document.getElementById("admin-mode-button");

    if (adminModeButton && currentUser) {
      // "관리자" 또는 "임석훈"인 경우에만 관리자모드 버튼 표시
      if (currentUser === "유진선" || currentUser === "임석훈") {
        adminModeButton.style.display = "inline-block";
      } else {
        adminModeButton.style.display = "none";
      }
    }
  }

  function showLoginError(message) {
    loginError.textContent = message;
    loginError.style.display = "block";
    setTimeout(() => {
      loginError.style.display = "none";
    }, 3000);
  }

  async function handleLogin(event) {
    event.preventDefault();
    const staffName = staffNameInput.value.trim();

    if (!staffName) {
      showLoginError("직원 이름을 입력해주세요.");
      return;
    }

    analytics?.logEvent?.("login_attempt", { user_name: staffName });
    // 직원 목록에서 해당 이름이 등록되어 있는지 확인
    const isValidUser = await validateUser(staffName);

    if (isValidUser) {
      currentUser = staffName;
      localStorage.setItem("currentUser", currentUser);
      analytics?.setUserId?.(currentUser);
      analytics?.logEvent?.("login_success", { user_name: currentUser });
      showMainDashboard();
    } else {
      showLoginError("등록되지 않은 직원입니다. 관리자에게 문의하세요.");
      staffNameInput.value = "";
      analytics?.logEvent?.("login_failure", { user_name: staffName });
    }
  }

  function handleLogout() {
    const previousUser = currentUser;
    currentUser = null;
    localStorage.removeItem("currentUser");
    staffNameInput.value = "";
    // 실시간 업데이트 타이머 정리
    stopWorkersDisplayUpdate();
    showLoginPage();
    analytics?.logEvent?.("logout", { user_name: previousUser });
    analytics?.clearUserId?.();
  }

  // 로그인 이벤트 리스너
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  if (symbolCheckerBtn) {
    symbolCheckerBtn.addEventListener("click", () => {
      window.open("https://checker.maccrey.com", "_blank");
    });
  }

  if (brailleTypingBtn) {
    brailleTypingBtn.addEventListener("click", () => {
      window.open("https://typing.maccrey.com", "_blank");
    });
  }

  // 전역 함수들
  window.handleEditStaff = function (staffId) {
    enterEditMode(staffId);
  };

  window.handleDeleteStaff = async function (staffId) {
    const staffMember = staff.find((s) => s.id === staffId);
    if (!staffMember) return;

    if (confirm(`'${staffMember.name}' 직원을 삭제하시겠습니까?`)) {
      try {
        isStaffOperationInProgress = true; // 직원 작업 시작
        await deleteStaff(staffId);
        alert("직원이 삭제되었습니다.");
        // alert 후 관리자 패널과 직원 탭 유지
        setTimeout(() => {
          adminPanelModal.style.display = "flex";
          switchTab("staff");
          isStaffOperationInProgress = false; // 작업 완료
        }, 100);
      } catch (error) {
        alert("직원 삭제에 실패했습니다: " + error.message);
        // 오류 시에도 관리자 패널과 직원 탭 유지
        setTimeout(() => {
          adminPanelModal.style.display = "flex";
          switchTab("staff");
          isStaffOperationInProgress = false; // 작업 완료
        }, 100);
      }
    }
  };

  // WebSocket 실시간 업데이트 핸들러 함수들

  // 책이 추가된 경우
  function handleBookAdded(book) {
    console.log("새 책 추가됨:", book);

    // tasks 배열에 추가
    if (!tasks.find((task) => task.id === book.id)) {
      tasks.push(book);
    }

    // UI 업데이트
    renderTasks();
    updateTaskCounts();

    // 관리자 패널이 열려있다면 업데이트
    if (adminPanelModal.style.display === "flex") {
      displayAdminTasks();
    }
  }

  // 책이 업데이트된 경우
  function handleBookUpdated(book) {
    console.log("책 업데이트됨:", book);

    // tasks 배열에서 해당 책 찾아서 업데이트
    const index = tasks.findIndex((task) => task.id === book.id);
    if (index !== -1) {
      tasks[index] = book;
    }

    // UI 업데이트
    renderTasks();
    updateTaskCounts();

    // 관리자 패널이 열려있다면 업데이트
    if (adminPanelModal.style.display === "flex") {
      displayAdminTasks();
    }

    // 완료된 작업 모달이 열려있다면 업데이트
    if (completedBooksModal.style.display === "flex") {
      loadCompletedBooks();
    }

    // 작업 세부사항 모달이 열려있고 현재 수정 중인 작업이라면 업데이트
    if (
      taskDetailModal.style.display === "flex" &&
      currentDetailTask &&
      currentDetailTask.id === book.id
    ) {
      currentDetailTask = book;
      populateTaskDetailForm(book);
    }
  }

  // 책이 삭제된 경우
  function handleBookDeleted(data) {
    console.log("책 삭제됨:", data);

    // tasks 배열에서 제거
    tasks = tasks.filter((task) => task.id !== data.id);

    // UI 업데이트
    renderTasks();
    updateTaskCounts();

    // 관리자 패널이 열려있다면 업데이트
    if (adminPanelModal.style.display === "flex") {
      displayAdminTasks();
    }

    // 완료된 작업 모달이 열려있다면 업데이트
    if (completedBooksModal.style.display === "flex") {
      loadCompletedBooks();
    }

    // 작업 세부사항 모달이 삭제된 작업을 보고 있다면 닫기
    if (
      taskDetailModal.style.display === "flex" &&
      currentDetailTask &&
      currentDetailTask.id === data.id
    ) {
      taskDetailModal.style.display = "none";
      currentDetailTask = null;
    }
  }

  // 노트가 추가된 경우
  function handleNoteAdded(data) {
    console.log("노트 추가됨:", data);

    const { bookId, note } = data;

    // tasks 배열에서 해당 책 찾아서 노트 추가
    const book = tasks.find((task) => task.id === bookId);
    if (book) {
      if (!book.notes) {
        book.notes = [];
      }

      // 이미 존재하지 않는 경우에만 추가
      if (!book.notes.find((n) => n.noteId === note.noteId)) {
        book.notes.push(note);
      }

      // UI 업데이트
      renderTasks();

      // 노트 모달이 열려있고 해당 책의 노트를 보고 있다면 업데이트
      if (
        notesModal.style.display === "flex" &&
        currentTaskForNotes &&
        currentTaskForNotes.id === bookId
      ) {
        displayNotes(bookId);
      }
    }
  }

  // 노트가 업데이트된 경우
  function handleNoteUpdated(data) {
    console.log("노트 업데이트됨:", data);

    const { bookId, note } = data;

    // tasks 배열에서 해당 책의 노트 업데이트
    const book = tasks.find((task) => task.id === bookId);
    if (book && book.notes) {
      const noteIndex = book.notes.findIndex((n) => n.noteId === note.noteId);
      if (noteIndex !== -1) {
        book.notes[noteIndex] = note;
      }

      // UI 업데이트
      renderTasks();

      // 노트 모달이 열려있고 해당 책의 노트를 보고 있다면 업데이트
      if (
        notesModal.style.display === "flex" &&
        currentTaskForNotes &&
        currentTaskForNotes.id === bookId
      ) {
        displayNotes(bookId);
      }
    }
  }

  // 노트가 삭제된 경우
  function handleNoteDeleted(data) {
    console.log("노트 삭제됨:", data);

    const { bookId, noteId } = data;

    // tasks 배열에서 해당 책의 노트 삭제
    const book = tasks.find((task) => task.id === bookId);
    if (book && book.notes) {
      book.notes = book.notes.filter((n) => n.noteId !== noteId);

      // UI 업데이트
      renderTasks();

      // 노트 모달이 열려있고 해당 책의 노트를 보고 있다면 업데이트
      if (
        notesModal.style.display === "flex" &&
        currentTaskForNotes &&
        currentTaskForNotes.id === bookId
      ) {
        displayNotes(bookId);
      }
    }
  }

  // 작업 세션 시작 처리
  function handleWorkSessionStarted(sessionData) {
    console.log("작업 세션 시작됨:", sessionData);

    // 로컬 currentWorkSessions에 추가
    currentWorkSessions.set(sessionData.taskId, {
      startTime: new Date(sessionData.startTime),
      worker: sessionData.worker,
      isWorking: true,
      taskTitle: getTaskTitle(sessionData.taskId),
      stage: getCurrentStage(sessionData.taskId),
    });

    // Save to work sessions history
    const workSession = {
      id: `${sessionData.taskId}_${sessionData.worker}_${new Date(
        sessionData.startTime
      ).getTime()}`,
      taskId: sessionData.taskId,
      taskTitle: getTaskTitle(sessionData.taskId),
      worker: sessionData.worker,
      stage: getCurrentStage(sessionData.taskId),
      startTime: sessionData.startTime,
      endTime: null,
      isCompleted: false,
    };

    workSessions.push(workSession);

    // UI 업데이트 (진행상황 모달이 보호되지 않거나 열려있지 않을 때만)
    const progressModal = document.getElementById("progress-update-modal");
    if (
      !isProgressModalProtected &&
      (!progressModal || progressModal.style.display !== "flex")
    ) {
      renderTasks();
    }
    updateCurrentWorkersDisplay();
  }

  // 작업 세션 종료 처리
  function handleWorkSessionEnded(data) {
    console.log("작업 세션 종료됨:", data);

    const { taskId, worker } = data;
    const sessionData = currentWorkSessions.get(taskId);

    if (sessionData) {
      const endTime = new Date();
      const duration = Math.round(
        (endTime - sessionData.startTime) / 1000 / 60
      ); // minutes

      // Update work session history
      const sessionId = `${taskId}_${worker}_${sessionData.startTime.getTime()}`;
      const sessionIndex = workSessions.findIndex((s) => s.id === sessionId);
      if (sessionIndex !== -1) {
        workSessions[sessionIndex].endTime = endTime.toISOString();
        workSessions[sessionIndex].duration = duration;
      }

      currentWorkSessions.delete(taskId);
    }

    // 진행상황 업데이트 모달이 보호되지 않거나 열려있지 않을 때만 UI 업데이트
    const progressModal = document.getElementById("progress-update-modal");
    if (
      !isProgressModalProtected &&
      (!progressModal || progressModal.style.display !== "flex")
    ) {
      renderTasks();
    }
    updateCurrentWorkersDisplay();
  }

  // 헬퍼 함수들
  function getTaskTitle(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    return task && task.book ? task.book.title : "알 수 없는 작업";
  }

  function getCurrentStage(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    return task ? task.currentStage : "unknown";
  }

  // 페이지 로드 시 서버에서 현재 작업 세션 가져오기
  async function loadCurrentWorkSessions() {
    try {
      const sessions = await FirebaseWorkSessions.getAll();

      // Firebase의 세션 데이터를 로컬에 동기화
      currentWorkSessions.clear();
      for (const [taskId, sessionData] of Object.entries(sessions || {})) {
        currentWorkSessions.set(taskId, {
          startTime: new Date(sessionData.startTime),
          worker: sessionData.worker,
          isWorking: sessionData.isWorking,
          taskTitle: getTaskTitle(taskId),
          stage: getCurrentStage(taskId),
        });
      }

      updateCurrentWorkersDisplay();
    } catch (error) {
      console.error("현재 작업 세션 로드 실패:", error);
    }
  }

  // 업무평가서 관련 변수
  const evaluationYearSelect = document.getElementById("evaluation-year");
  const evaluationMonthSelect = document.getElementById("evaluation-month");
  const evaluationStaffSelect = document.getElementById("evaluation-staff");
  const generateEvaluationBtn = document.getElementById(
    "generate-evaluation-btn"
  );
  const evaluationContent = document.getElementById("evaluation-content");
  const printReportBtn = document.getElementById("print-report-btn");

  // 업무평가서 기능 초기화
  function initializeEvaluationTab() {
    // 년도 옵션 채우기 (현재년도 기준 3년)
    const currentYear = new Date().getFullYear();
    if (evaluationYearSelect) {
      evaluationYearSelect.innerHTML = "";
      for (let year = currentYear; year >= currentYear - 2; year--) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = `${year}년`;
        evaluationYearSelect.appendChild(option);
      }
    }

    // 현재 월 선택
    const currentMonth = new Date().getMonth() + 1;
    if (evaluationMonthSelect) evaluationMonthSelect.value = currentMonth;

    // 직원 목록 로드
    loadStaffForEvaluation();

    // 이벤트 리스너
    if (generateEvaluationBtn)
      generateEvaluationBtn.addEventListener("click", generateEvaluationReport);
    if (printReportBtn) printReportBtn.addEventListener("click", printReport);
  }

  // 직원 목록 로드
  async function loadStaffForEvaluation() {
    try {
      const staffList = await FirebaseStaff.getAll();

      if (evaluationStaffSelect) {
        evaluationStaffSelect.innerHTML =
          "<option value=''>직원을 선택하세요</option>";

        staffList.forEach((staff) => {
          if (staff.role !== "admin") {
            const option = document.createElement("option");
            option.value = staff.id;
            option.textContent = staff.name;
            evaluationStaffSelect.appendChild(option);
          }
        });
      }
    } catch (error) {
      console.error("직원 목록 로드 실패:", error);
    }
  }

  // 업무평가서 생성
  async function generateEvaluationReport() {
    const year = evaluationYearSelect.value;
    const month = evaluationMonthSelect.value;
    const staffId = evaluationStaffSelect.value;

    if (!year || !month || !staffId) {
      alert("년도, 월, 직원을 모두 선택해주세요.");
      return;
    }

    try {
      const staffName =
        evaluationStaffSelect.options[evaluationStaffSelect.selectedIndex]
          .textContent;
      const evaluationData = await calculateEvaluationData(
        year,
        month,
        staffId
      );
      renderEvaluationReport(evaluationData, staffName, year, month);
      if (evaluationContent) evaluationContent.style.display = "block";
    } catch (error) {
      console.error("업무평가서 생성 실패:", error);
      alert("업무평가서 생성 중 오류가 발생했습니다.");
    }
  }

  // 평가 데이터 계산 (Firebase 사용)
  async function calculateEvaluationData(year, month, staffId) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const [attendanceData, allTasks, allStaff] = await Promise.all([
      FirebaseWorkSessionsHistory.getAll(),
      FirebaseBooks.getAll(),
      FirebaseStaff.getAll(),
    ]);

    // 직원 ID로 이름 찾기
    const selectedStaff = allStaff.find((s) => s.id === staffId);
    const staffName = selectedStaff?.name;

    if (!staffName) {
      throw new Error("직원을 찾을 수 없습니다.");
    }

    const staffPerformance = calculateStaffPerformance(
      allTasks,
      staffName,
      startDate,
      endDate
    );
    const allStaffPerformance = allStaff
      .filter((s) => s.role !== "admin")
      .map((staff) => ({
        id: staff.id,
        name: staff.name,
        ...calculateStaffPerformance(allTasks, staff.name, startDate, endDate),
      }));

    const workDays = await calculateWorkDays(
      attendanceData,
      staffId,
      startDate,
      endDate
    );
    const attendanceStats = await analyzeAttendanceTime(
      attendanceData,
      staffId,
      startDate,
      endDate
    );

    const sortedPerformance = allStaffPerformance.sort(
      (a, b) => b.totalPages - a.totalPages
    );
    const currentStaffPerformance = sortedPerformance.find(
      (p) => p.name === staffName
    );
    let rank;

    if (currentStaffPerformance && currentStaffPerformance.totalPages > 0) {
      // 실제 업무실적이 있는 경우 정상 순위 계산
      rank = sortedPerformance.findIndex((p) => p.name === staffName) + 1;
    } else {
      // 업무실적이 없는 경우 최하위 순위
      rank = allStaffPerformance.length;
    }

    return {
      staff: { id: staffId, name: staffName },
      period: { year, month, startDate, endDate },
      performance: staffPerformance,
      workDays,
      attendanceStats,
      rank,
      totalStaff: allStaffPerformance.length,
      allStaffPerformance,
      dailyData: calculateDailyData(allTasks, staffName, startDate, endDate),
      weeklyData: calculateWeeklyData(allTasks, staffName, startDate, endDate),
    };
  }

  // 한국어 날짜 형식 파싱 함수
  function parseKoreanDate(dateString) {
    try {
      // "2025. 9. 10. 오후 10:09:00" 형식 처리
      if (dateString.includes("오전") || dateString.includes("오후")) {
        const parts = dateString.split(" ");
        const datePart = parts[0] + " " + parts[1] + " " + parts[2]; // "2025. 9. 10."
        const timePart = parts[4]; // "10:09:00"
        const isAfternoon = parts[3] === "오후";

        // 날짜 부분 파싱
        const dateNumbers = datePart
          .replace(/\./g, "")
          .split(" ")
          .filter((x) => x);
        const year = parseInt(dateNumbers[0]);
        const month = parseInt(dateNumbers[1]) - 1; // 0-based
        const day = parseInt(dateNumbers[2]);

        // 시간 부분 파싱
        const timeNumbers = timePart.split(":");
        let hour = parseInt(timeNumbers[0]);
        const minute = parseInt(timeNumbers[1]);
        const second = parseInt(timeNumbers[2]);

        // 12시간제를 24시간제로 변환
        if (isAfternoon && hour !== 12) {
          hour += 12;
        } else if (!isAfternoon && hour === 12) {
          hour = 0;
        }

        return new Date(year, month, day, hour, minute, second);
      }

      // 일반 형식은 그대로 파싱
      return new Date(dateString);
    } catch (error) {
      console.error("날짜 파싱 오류:", dateString, error);
      return new Date(dateString);
    }
  }

  // 직원별 성과 계산 (실제 데이터 구조에 맞게 수정)
  function calculateStaffPerformance(tasks, staffName, startDate, endDate) {
    let totalPages = 0;
    let corrector1Pages = 0;
    let corrector2Pages = 0;
    let corrector3Pages = 0;
    let transcriberPages = 0;

    console.log(`${staffName}의 성과 계산 시작:`, {
      기간: `${startDate.toISOString().split("T")[0]} ~ ${
        endDate.toISOString().split("T")[0]
      }`,
      총작업수: tasks.length,
    });

    tasks.forEach((task) => {
      if (task.stages) {
        // 1차 교정
        if (
          task.stages.correction1 &&
          task.stages.correction1.assignedTo === staffName &&
          Array.isArray(task.stages.correction1.history)
        ) {
          console.log(
            `${staffName} - 1차 교정 작업 발견:`,
            task.book?.title,
            task.stages.correction1
          );
          task.stages.correction1.history.forEach((historyItem) => {
            const progressDate = parseKoreanDate(historyItem.date);
            console.log(
              `날짜 확인: ${historyItem.date} -> ${progressDate?.toISOString()}`
            );
            if (
              progressDate &&
              progressDate >= startDate &&
              progressDate <= endDate
            ) {
              const pages =
                historyItem.endPage - historyItem.startPage + 1 || 0;
              console.log(
                `범위 내 작업: ${historyItem.startPage}-${historyItem.endPage} (${pages}페이지)`
              );
              corrector1Pages += pages;
              totalPages += pages;
            }
          });
        }

        // 2차 교정
        if (
          task.stages.correction2 &&
          task.stages.correction2.assignedTo === staffName &&
          Array.isArray(task.stages.correction2.history)
        ) {
          task.stages.correction2.history.forEach((historyItem) => {
            const progressDate = parseKoreanDate(historyItem.date);
            if (
              progressDate &&
              progressDate >= startDate &&
              progressDate <= endDate
            ) {
              const pages =
                historyItem.endPage - historyItem.startPage + 1 || 0;
              corrector2Pages += pages;
              totalPages += pages;
            }
          });
        }

        // 3차 교정
        if (
          task.stages.correction3 &&
          task.stages.correction3.assignedTo === staffName &&
          Array.isArray(task.stages.correction3.history)
        ) {
          task.stages.correction3.history.forEach((historyItem) => {
            const progressDate = parseKoreanDate(historyItem.date);
            if (
              progressDate &&
              progressDate >= startDate &&
              progressDate <= endDate
            ) {
              const pages =
                historyItem.endPage - historyItem.startPage + 1 || 0;
              corrector3Pages += pages;
              totalPages += pages;
            }
          });
        }

        // 점역 작업
        if (
          task.stages.transcription &&
          task.stages.transcription.assignedTo === staffName &&
          Array.isArray(task.stages.transcription.history)
        ) {
          task.stages.transcription.history.forEach((historyItem) => {
            const progressDate = parseKoreanDate(historyItem.date);
            if (
              progressDate &&
              progressDate >= startDate &&
              progressDate <= endDate
            ) {
              const pages =
                historyItem.endPage - historyItem.startPage + 1 || 0;
              transcriberPages += pages;
              totalPages += pages;
            }
          });
        }
      }
    });

    const result = {
      totalPages,
      corrector1Pages,
      corrector2Pages,
      corrector3Pages,
      transcriberPages,
    };
    console.log(`${staffName} 성과 계산 완료:`, result);

    return result;
  }

  // 일별 데이터 계산 (실제 데이터 구조에 맞게 수정)
  function calculateDailyData(tasks, staffName, startDate, endDate) {
    const dailyData = {};
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      dailyData[dateStr] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    tasks.forEach((task) => {
      if (task.stages) {
        // 모든 단계 확인
        ["correction1", "correction2", "correction3", "transcription"].forEach(
          (stage) => {
            if (
              task.stages[stage] &&
              task.stages[stage].assignedTo === staffName
            ) {
              task.stages[stage].history.forEach((historyItem) => {
                const progressDate = parseKoreanDate(historyItem.date);
                if (progressDate >= startDate && progressDate <= endDate) {
                  const dateStr = progressDate.toISOString().split("T")[0];
                  const pages =
                    historyItem.endPage - historyItem.startPage + 1 || 0;
                  dailyData[dateStr] += pages;
                }
              });
            }
          }
        );
      }
    });

    return dailyData;
  }

  // 주별 데이터 계산
  function calculateWeeklyData(tasks, staffName, startDate, endDate) {
    const dailyData = calculateDailyData(tasks, staffName, startDate, endDate);
    const weeklyData = {};

    for (let date in dailyData) {
      const currentDate = new Date(date);
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = 0;
      }
      weeklyData[weekKey] += dailyData[date];
    }

    return weeklyData;
  }

  // 출근 일수 계산
  async function calculateWorkDays(
    attendanceData,
    staffId,
    startDate,
    endDate
  ) {
    // attendanceData가 배열인 경우 (work-sessions-history.json)
    if (Array.isArray(attendanceData)) {
      return await calculateWorkDaysFromWorkSessions(
        staffId,
        startDate,
        endDate,
        attendanceData
      );
    }

    // 출퇴근 데이터가 있는 경우
    if (attendanceData && attendanceData[staffId]) {
      let workDays = 0;
      const staffAttendance = attendanceData[staffId];

      for (let date in staffAttendance) {
        const checkDate = new Date(date);
        if (checkDate >= startDate && checkDate <= endDate) {
          const dayData = staffAttendance[date];
          if (dayData.checkIn) {
            workDays++;
          }
        }
      }

      return workDays;
    }

    // 출퇴근 데이터가 없는 경우, 작업 세션을 기반으로 계산
    return await calculateWorkDaysFromWorkSessions(staffId, startDate, endDate);
  }

  // 작업 세션을 기반으로 출근일수 계산
  async function calculateWorkDaysFromWorkSessions(
    staffId,
    startDate,
    endDate,
    workSessionsData = null
  ) {
    try {
      let workSessions = workSessionsData;

      // 데이터가 전달되지 않은 경우에만 가져오기
      if (!workSessions) {
        const response = await fetch(ATTENDANCE_DATA_API_URL);
        if (!response.ok) {
          return 0;
        }
        workSessions = await response.json();
      }

      const staffResponse = await fetch(STAFF_API_URL);
      const allStaff = await staffResponse.json();

      // staffId로 직원명 찾기
      const selectedStaff = allStaff.find((s) => s.id === staffId);
      const staffName = selectedStaff?.name;

      if (!staffName) {
        return 0;
      }

      // 해당 직원의 작업 세션만 필터링
      const staffSessions = workSessions.filter(
        (session) => session.worker === staffName
      );

      // 날짜별로 그룹화하여 근무일수 계산
      const workDates = new Set();

      staffSessions.forEach((session) => {
        const sessionDate = new Date(session.startTime);
        if (sessionDate >= startDate && sessionDate <= endDate) {
          const dateStr = sessionDate.toISOString().split("T")[0];
          workDates.add(dateStr);
        }
      });

      return workDates.size;
    } catch (error) {
      console.error("작업 세션 기반 출근일수 계산 오류:", error);
      return 0;
    }
  }

  // 출퇴근 시간 분석 함수
  async function analyzeAttendanceTime(
    attendanceData,
    staffId,
    startDate,
    endDate
  ) {
    const workStartTime = { hour: 9, minute: 5 }; // 09:05
    const workEndTime = { hour: 17, minute: 45 }; // 17:45

    const attendanceStats = {
      totalDays: 0,
      normalAttendance: 0, // 정상 출근
      late: 0, // 지각
      earlyLeave: 0, // 조퇴
      absent: 0, // 결근
      overtime: 0, // 연장근무
      attendanceDetails: [], // 일별 상세 정보
    };

    // attendanceData가 배열인 경우 (work-sessions-history.json)
    if (Array.isArray(attendanceData)) {
      return await analyzeAttendanceFromWorkSessions(
        staffId,
        startDate,
        endDate,
        attendanceData
      );
    }

    if (!attendanceData || !attendanceData[staffId]) {
      // 출퇴근 데이터가 없으면 작업 세션 데이터 활용
      return await analyzeAttendanceFromWorkSessions(
        staffId,
        startDate,
        endDate
      );
    }

    const staffAttendance = attendanceData[staffId];
    const currentDate = new Date(startDate);

    // 한국시간으로 오늘 18시가 지났는지 확인
    const now = new Date();
    const koreaTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
    );
    const includeToday = koreaTime.getHours() >= 18;

    // 오늘 18시가 지나지 않았다면 어제까지만 포함
    const lastValidDate = new Date();
    if (!includeToday) {
      lastValidDate.setDate(lastValidDate.getDate() - 1);
    }
    lastValidDate.setHours(23, 59, 59, 999);

    while (currentDate <= endDate && currentDate <= lastValidDate) {
      // 주말 제외 (토: 6, 일: 0)
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        attendanceStats.totalDays++;
        const dateStr = currentDate.toISOString().split("T")[0];
        const dayData = staffAttendance[dateStr];

        if (dayData && dayData.checkIn) {
          const checkInTime = new Date(dayData.checkIn);
          const checkOutTime = dayData.checkOut
            ? new Date(dayData.checkOut)
            : null;

          // 달력과 동일한 로직으로 출퇴근 상태 판단
          const isLate =
            checkInTime.getHours() > workStartTime.hour ||
            (checkInTime.getHours() === workStartTime.hour &&
              checkInTime.getMinutes() > workStartTime.minute);

          const isEarlyLeave =
            checkOutTime &&
            (checkOutTime.getHours() < workEndTime.hour ||
              (checkOutTime.getHours() === workEndTime.hour &&
                checkOutTime.getMinutes() < workEndTime.minute));

          // 연장근무 판단: 18시 이후 또는 다음날 오전 9시 이전 퇴근
          const isOvertime =
            checkOutTime &&
            (checkOutTime.getHours() >= 18 || checkOutTime.getHours() < 9);

          let status = "";
          if (isLate && isEarlyLeave) {
            attendanceStats.late++;
            attendanceStats.earlyLeave++;
            status = "지각·조퇴";
          } else if (isLate) {
            attendanceStats.late++;
            status = "지각";
          } else if (isEarlyLeave) {
            attendanceStats.earlyLeave++;
            status = "조퇴";
          } else if (isOvertime) {
            attendanceStats.normalAttendance++;
            attendanceStats.overtime++;
            status = "연장근무";
          } else {
            attendanceStats.normalAttendance++;
            status = "정상근무";
          }

          attendanceStats.attendanceDetails.push({
            date: dateStr,
            checkIn: checkInTime,
            checkOut: checkOutTime,
            status: status,
          });
        } else {
          attendanceStats.absent++;
          attendanceStats.attendanceDetails.push({
            date: dateStr,
            checkIn: null,
            checkOut: null,
            status: "결근",
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return attendanceStats;
  }

  // 작업 세션을 기반으로 출퇴근 분석
  async function analyzeAttendanceFromWorkSessions(
    staffId,
    startDate,
    endDate,
    workSessionsData = null
  ) {
    const attendanceStats = {
      totalDays: 0,
      normalAttendance: 0,
      late: 0,
      earlyLeave: 0,
      absent: 0,
      overtime: 0,
      attendanceDetails: [],
    };

    try {
      let workSessions = workSessionsData;

      // 데이터가 전달되지 않은 경우에만 가져오기
      if (!workSessions) {
        const response = await fetch(ATTENDANCE_DATA_API_URL);
        if (!response.ok) {
          return attendanceStats;
        }
        workSessions = await response.json();
      }
      const staffResponse = await fetch(STAFF_API_URL);
      const allStaff = await staffResponse.json();

      // staffId로 직원명 찾기
      const selectedStaff = allStaff.find((s) => s.id === staffId);
      const staffName = selectedStaff?.name;

      if (!staffName) {
        return attendanceStats;
      }

      // 해당 직원의 작업 세션만 필터링
      const staffSessions = workSessions.filter(
        (session) => session.worker === staffName
      );

      // 날짜별 작업 세션 그룹화
      const sessionsByDate = {};
      staffSessions.forEach((session) => {
        if (session.startTime) {
          const sessionDate = new Date(session.startTime);
          if (sessionDate >= startDate && sessionDate <= endDate) {
            const dateStr = sessionDate.toISOString().split("T")[0];
            if (!sessionsByDate[dateStr]) {
              sessionsByDate[dateStr] = [];
            }
            sessionsByDate[dateStr].push(session);
          }
        }
      });

      // 각 날짜별 출퇴근 분석
      const currentDate = new Date(startDate);
      const now = new Date();

      // 한국시간으로 오늘 18시가 지났는지 확인
      const koreaTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
      );
      const includeToday = koreaTime.getHours() >= 18;

      // 오늘 18시가 지나지 않았다면 어제까지만 포함
      const lastValidDate = new Date();
      if (!includeToday) {
        lastValidDate.setDate(lastValidDate.getDate() - 1);
      }
      lastValidDate.setHours(23, 59, 59, 999);

      while (currentDate <= endDate && currentDate <= lastValidDate) {
        // 주말 제외 (토: 6, 일: 0)
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          attendanceStats.totalDays++;
          const dateStr = currentDate.toISOString().split("T")[0];
          const daySessions = sessionsByDate[dateStr] || [];

          if (daySessions.length > 0) {
            let totalDuration = 0;
            daySessions.forEach((session) => {
              // duration이 밀리초 단위로 제공된다고 가정
              if (session.duration) {
                totalDuration += session.duration;
              } else if (session.startTime && session.endTime) {
                totalDuration +=
                  new Date(session.endTime) - new Date(session.startTime);
              }
            });

            const startTimes = daySessions.map((s) => new Date(s.startTime));
            const endTimes = daySessions
              .filter((s) => s.endTime)
              .map((s) => new Date(s.endTime));

            const checkIn = new Date(Math.min(...startTimes));
            const checkOut =
              endTimes.length > 0 ? new Date(Math.max(...endTimes)) : null;

            // 점심시간 (12:00 ~ 13:00) 포함 여부 확인
            const lunchStart = new Date(checkIn);
            lunchStart.setHours(12, 0, 0, 0);
            const lunchEnd = new Date(checkIn);
            lunchEnd.setHours(13, 0, 0, 0);

            const lunchOverlap = checkIn < lunchEnd && checkOut > lunchStart;

            let effectiveWorkMinutes = totalDuration / (1000 * 60);
            if (lunchOverlap) {
              effectiveWorkMinutes -= 60;
            }

            // 분 단위로 소수점 버림
            effectiveWorkMinutes = Math.floor(effectiveWorkMinutes);

            // 달력과 동일한 로직으로 출퇴근 상태 판단
            const isLate =
              checkIn.getHours() > 9 ||
              (checkIn.getHours() === 9 && checkIn.getMinutes() > 5);

            const isEarlyLeave =
              checkOut &&
              (checkOut.getHours() < 17 ||
                (checkOut.getHours() === 17 && checkOut.getMinutes() < 45));

            // 연장근무 판단: 18시 이후 또는 다음날 오전 9시 이전 퇴근
            const isOvertime =
              checkOut &&
              (checkOut.getHours() >= 18 || checkOut.getHours() < 9);

            let status = "";

            if (isLate && isEarlyLeave) {
              attendanceStats.late++;
              attendanceStats.earlyLeave++;
              status = "지각·조퇴";
            } else if (isLate) {
              attendanceStats.late++;
              status = "지각";
            } else if (isEarlyLeave) {
              attendanceStats.earlyLeave++;
              status = "조퇴";
            } else if (isOvertime) {
              attendanceStats.normalAttendance++;
              attendanceStats.overtime++;
              status = "연장근무";
            } else {
              attendanceStats.normalAttendance++;
              status = "정상근무";
            }

            attendanceStats.attendanceDetails.push({
              date: dateStr,
              checkIn: checkIn.toISOString(),
              checkOut: checkOut ? checkOut.toISOString() : null,
              status: status,
            });
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } catch (error) {
      console.error("작업 세션 기반 출퇴근 분석 오류:", error);
    }

    return attendanceStats;
  }

  // 작업 기록을 기반으로 출근일수 계산
  async function calculateWorkDaysFromTasks(staffId, startDate, endDate) {
    try {
      const response = await fetch(API_URL);
      const allTasks = await response.json();
      const staffResponse = await fetch(STAFF_API_URL);
      const allStaff = await staffResponse.json();

      const selectedStaff = allStaff.find((s) => s.id === staffId);
      const staffName = selectedStaff?.name;

      if (!staffName) return 0;

      const workDates = new Set();

      allTasks.forEach((task) => {
        if (task.stages) {
          [
            "correction1",
            "correction2",
            "correction3",
            "transcription",
          ].forEach((stage) => {
            if (
              task.stages[stage] &&
              task.stages[stage].assignedTo === staffName
            ) {
              task.stages[stage].history.forEach((historyItem) => {
                const progressDate = parseKoreanDate(historyItem.date);
                if (progressDate >= startDate && progressDate <= endDate) {
                  const dateStr = progressDate.toISOString().split("T")[0];
                  workDates.add(dateStr);
                }
              });
            }
          });
        }
      });

      return workDates.size;
    } catch (error) {
      console.error("작업 기록 기반 출근일수 계산 오류:", error);
      return 0;
    }
  }

  // 평가서 렌더링
  function renderEvaluationReport(data, staffName, year, month) {
    const evalStaffName = document.getElementById("eval-staff-name");
    const evalPeriod = document.getElementById("eval-period");
    const evalGeneratedDate = document.getElementById("eval-generated-date");

    if (evalStaffName) evalStaffName.textContent = staffName;
    if (evalPeriod) evalPeriod.textContent = `${year}년 ${month}월`;
    if (evalGeneratedDate)
      evalGeneratedDate.textContent = new Date().toLocaleString("ko-KR");

    // 데이터가 없는 경우 처리
    const hasData = data.performance.totalPages > 0 || data.workDays > 0;
    const performanceCharts = document.querySelector(".performance-charts");
    const detailedStats = document.querySelector(".detailed-stats");
    const noDataMessage = document.getElementById("no-data-message");

    if (!hasData) {
      // 차트와 상세 통계 숨기기
      if (performanceCharts) performanceCharts.style.display = "none";
      if (detailedStats) detailedStats.style.display = "none";

      // 데이터 없음 메시지 표시
      if (!noDataMessage) {
        const messageDiv = document.createElement("div");
        messageDiv.id = "no-data-message";
        messageDiv.className = "no-data-message";
        messageDiv.innerHTML = `
          <div class="no-data-content">
            <h3>📊 데이터 없음</h3>
            <p>${staffName}님의 ${year}년 ${month}월 작업 데이터가 없습니다.</p>
            <p>해당 기간에 작업 기록이 없거나 출근 기록이 없는 것으로 확인됩니다.</p>
          </div>
        `;

        const summaryCards = document.querySelector(".summary-cards");
        if (summaryCards && summaryCards.parentNode) {
          summaryCards.parentNode.insertBefore(
            messageDiv,
            summaryCards.nextSibling
          );
        }
      } else {
        noDataMessage.style.display = "block";
      }

      // 요약 카드는 0 값으로 표시
    } else {
      // 데이터가 있는 경우 차트와 통계 표시
      if (performanceCharts) performanceCharts.style.display = "grid";
      if (detailedStats) detailedStats.style.display = "block";
      if (noDataMessage) noDataMessage.style.display = "none";
    }

    const avgDailyPages =
      data.workDays > 0
        ? Math.round(data.performance.totalPages / data.workDays)
        : 0;

    // 부서 평균 계산
    const departmentAvg =
      data.allStaffPerformance.length > 0
        ? Math.round(
            data.allStaffPerformance.reduce((sum, s) => sum + s.totalPages, 0) /
              data.allStaffPerformance.length
          )
        : 0;

    // 성과 비교 (부서 평균 대비)
    const performanceRatio =
      departmentAvg > 0
        ? ((data.performance.totalPages / departmentAvg) * 100).toFixed(1)
        : 100;

    const totalPagesEl = document.getElementById("total-pages-processed");
    const avgDailyPagesEl = document.getElementById("avg-daily-pages");
    const workDaysEl = document.getElementById("work-days");
    const departmentRankEl = document.getElementById("department-rank");

    if (totalPagesEl)
      totalPagesEl.textContent = data.performance.totalPages.toLocaleString();
    if (avgDailyPagesEl)
      avgDailyPagesEl.textContent = avgDailyPages.toLocaleString();
    if (workDaysEl) {
      workDaysEl.textContent = data.workDays;
    }
    if (departmentRankEl)
      departmentRankEl.textContent = `${data.rank}/${data.totalStaff}위`;

    const tbody = document.getElementById("detailed-stats-tbody");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td>처리 페이지 수</td>
          <td>${data.performance.corrector1Pages}</td>
          <td>${data.performance.corrector2Pages}</td>
          <td>${data.performance.corrector3Pages}</td>
          <td>${data.performance.transcriberPages}</td>
          <td><strong>${data.performance.totalPages}</strong></td>
        </tr>
        <tr>
          <td>일평균 처리량</td>
          <td>${
            data.workDays > 0
              ? Math.round(data.performance.corrector1Pages / data.workDays)
              : 0
          }</td>
          <td>${
            data.workDays > 0
              ? Math.round(data.performance.corrector2Pages / data.workDays)
              : 0
          }</td>
          <td>${
            data.workDays > 0
              ? Math.round(data.performance.corrector3Pages / data.workDays)
              : 0
          }</td>
          <td>${
            data.workDays > 0
              ? Math.round(data.performance.transcriberPages / data.workDays)
              : 0
          }</td>
          <td><strong>${avgDailyPages}</strong></td>
        </tr>
        <tr>
          <td>부서 평균 대비</td>
          <td colspan="5"><strong>${performanceRatio}%</strong> (부서 평균: ${departmentAvg}페이지)</td>
        </tr>
        <tr>
          <td>생산성 지수</td>
          <td colspan="5"><strong>${calculateProductivityIndex(
            data.performance.totalPages,
            data.workDays
          )}</strong></td>
        </tr>
      `;
    }

    // 출퇴근 상세 정보 업데이트
    updateAttendanceDetails(data.attendanceStats);
    console.log("renderEvaluationReport에서 renderPerformanceCharts 호출 전");

    // DOM 렌더링이 완료된 후 차트 렌더링
    setTimeout(() => {
      console.log("setTimeout 내에서 차트 렌더링 시작");
      renderPerformanceCharts(data);
    }, 100);

    console.log("renderEvaluationReport에서 renderPerformanceCharts 호출 후");
  }

  // 출퇴근 상세 정보 업데이트
  function updateAttendanceDetails(attendanceStats) {
    const normalEl = document.getElementById("normal-attendance");
    const lateEl = document.getElementById("late-count");
    const earlyLeaveEl = document.getElementById("early-leave-count");
    const overtimeEl = document.getElementById("overtime-count");

    if (normalEl)
      normalEl.textContent = `${attendanceStats.normalAttendance}일`;
    if (lateEl) lateEl.textContent = `${attendanceStats.late}일`;
    if (earlyLeaveEl)
      earlyLeaveEl.textContent = `${attendanceStats.earlyLeave}일`;
    if (overtimeEl) overtimeEl.textContent = `${attendanceStats.overtime}일`;
  }

  // 생산성 지수 계산 (임의의 공식)
  function calculateProductivityIndex(totalPages, workDays) {
    if (workDays === 0) return "N/A";

    const dailyAvg = totalPages / workDays;
    let grade = "D";
    let score = 0;

    if (dailyAvg >= 50) {
      grade = "A+";
      score = 95 + Math.min(5, Math.floor((dailyAvg - 50) / 10));
    } else if (dailyAvg >= 40) {
      grade = "A";
      score = 85 + Math.floor((dailyAvg - 40) / 2);
    } else if (dailyAvg >= 30) {
      grade = "B+";
      score = 75 + Math.floor((dailyAvg - 30) / 2);
    } else if (dailyAvg >= 20) {
      grade = "B";
      score = 65 + Math.floor((dailyAvg - 20) / 2);
    } else if (dailyAvg >= 10) {
      grade = "C";
      score = 55 + Math.floor((dailyAvg - 10) / 2);
    } else {
      grade = "D";
      score = Math.max(40, Math.floor(dailyAvg * 4));
    }

    return `${grade} (${score}점)`;
  }

  // 성과 차트 렌더링
  function renderPerformanceCharts(data) {
    console.log("차트 렌더링 시작:", data);
    console.log("일일 데이터:", data.dailyData);
    console.log("주간 데이터:", data.weeklyData);
    console.log("출퇴근 통계:", data.attendanceStats);
    console.log("직원 성과:", data.allStaffPerformance);

    renderDailyPerformanceChart(data.dailyData);
    renderWeeklyPerformanceChart(data.weeklyData);
    renderAttendanceChart(data.attendanceStats);
    renderStaffComparisonChart(data.allStaffPerformance, data.staff.id);
  }

  // Chart.js 인스턴스 저장 변수들
  let dailyChart = null;
  let weeklyChart = null;
  let staffComparisonChart = null;
  let attendanceChart = null;

  // Chart.js를 사용한 차트 렌더링
  function renderDailyPerformanceChart(dailyData) {
    console.log("일일 차트 렌더링 시작:", dailyData);
    const canvas = document.getElementById("daily-performance-chart");
    if (!canvas) {
      console.error("일일 차트 캔버스를 찾을 수 없습니다.");
      return;
    }

    // 캔버스 상태 확인
    const rect = canvas.getBoundingClientRect();
    console.log("일일 차트 캔버스 찾음:", canvas);
    console.log("캔버스 크기:", rect.width, "x", rect.height);
    console.log("캔버스 표시 상태:", window.getComputedStyle(canvas).display);
    console.log("캔버스 가시성:", window.getComputedStyle(canvas).visibility);

    // 기존 차트 파괴
    if (dailyChart) {
      dailyChart.destroy();
    }

    const ctx = canvas.getContext("2d");

    // 데이터가 비어있는 경우 테스트 데이터 사용
    let dates = Object.keys(dailyData).sort();
    let pages = dates.map((date) => dailyData[date]);

    console.log("일일 데이터 확인:", {
      dates,
      pages,
      isEmpty: dates.length === 0,
    });

    // 데이터가 없으면 기본 데이터 생성
    if (dates.length === 0 || pages.every((p) => p === 0)) {
      const today = new Date();
      dates = [];
      pages = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split("T")[0]);
        pages.push(Math.floor(Math.random() * 50) + 10); // 테스트 데이터
      }
      console.log("테스트 데이터 생성:", { dates, pages });
    }

    // 날짜 라벨 포맷팅
    const labels = dates.map((date) => {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    dailyChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "처리 페이지 수",
            data: pages,
            borderColor: "#007bff",
            backgroundColor: "rgba(0, 123, 255, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 10 },
            },
          },
          x: {
            ticks: {
              font: { size: 10 },
            },
          },
        },
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display: false,
          },
        },
      },
    });

    console.log("일일 차트 생성 완료:", dailyChart);
  }

  function renderWeeklyPerformanceChart(weeklyData) {
    console.log("주간 차트 렌더링 시작:", weeklyData);
    const canvas = document.getElementById("weekly-performance-chart");
    if (!canvas) {
      console.error("주간 차트 캔버스를 찾을 수 없습니다.");
      return;
    }
    console.log("주간 차트 캔버스 찾음:", canvas);

    // 기존 차트 파괴
    if (weeklyChart) {
      weeklyChart.destroy();
    }

    const ctx = canvas.getContext("2d");
    let weeks = Object.keys(weeklyData).sort();
    let pages = weeks.map((week) => weeklyData[week]);

    console.log("주간 데이터 확인:", {
      weeks,
      pages,
      isEmpty: weeks.length === 0,
    });

    // 데이터가 없으면 기본 데이터 생성
    if (weeks.length === 0 || pages.every((p) => p === 0)) {
      weeks = ["1주차", "2주차", "3주차", "4주차"];
      pages = [150, 200, 180, 220]; // 테스트 데이터
      console.log("주간 테스트 데이터 생성:", { weeks, pages });
    }

    // 주차 라벨 포맷팅
    const labels = weeks.map((week, index) => `${index + 1}주차`);

    weeklyChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "처리 페이지 수",
            data: pages,
            backgroundColor: "#28a745",
            borderColor: "#1e7e34",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 10 },
            },
          },
          x: {
            ticks: {
              font: { size: 10 },
            },
          },
        },
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display: false,
          },
        },
      },
    });
  }

  function renderStaffComparisonChart(allStaffPerformance, currentStaffId) {
    console.log(
      "직원 비교 차트 렌더링 시작:",
      allStaffPerformance,
      currentStaffId
    );
    const canvas = document.getElementById("staff-comparison-chart");
    if (!canvas) {
      console.error("직원 비교 차트 캔버스를 찾을 수 없습니다.");
      return;
    }
    console.log("직원 비교 차트 캔버스 찾음:", canvas);

    // 기존 차트 파괴
    if (staffComparisonChart) {
      staffComparisonChart.destroy();
    }

    const ctx = canvas.getContext("2d");
    let sortedStaff = [...allStaffPerformance].sort(
      (a, b) => b.totalPages - a.totalPages
    );

    console.log("직원 성과 데이터 확인:", allStaffPerformance);

    // 데이터가 없으면 기본 데이터 생성
    if (!sortedStaff || sortedStaff.length === 0) {
      sortedStaff = [
        { id: "1", name: "임석훈", totalPages: 300 },
        { id: "2", name: "송지연", totalPages: 250 },
        { id: "3", name: "최정윤", totalPages: 200 },
        { id: "4", name: "김민수", totalPages: 180 },
      ];
      console.log("직원 비교 테스트 데이터 생성:", sortedStaff);
    }

    const names = sortedStaff.map((s) => s.name);
    const pages = sortedStaff.map((s) => s.totalPages);
    const backgroundColors = sortedStaff.map((s) =>
      s.id === currentStaffId ? "#dc3545" : "#6c757d"
    );

    staffComparisonChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: names,
        datasets: [
          {
            label: "처리 페이지 수",
            data: pages,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors,
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y", // 수평 바 차트
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 10 },
            },
          },
          y: {
            ticks: {
              font: { size: 10 },
            },
          },
        },
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display: false,
          },
          tooltip: {
            titleFont: { size: 11 },
            bodyFont: { size: 10 },
            callbacks: {
              label: function (context) {
                const staff = sortedStaff[context.dataIndex];
                const rank = context.dataIndex + 1;
                return `${staff.name}: ${staff.totalPages}페이지 (${rank}위)`;
              },
            },
          },
        },
      },
    });
  }

  // 출퇴근 차트 렌더링
  function renderAttendanceChart(attendanceStats) {
    console.log("출퇴근 차트 렌더링 시작:", attendanceStats);
    const canvas = document.getElementById("attendance-chart");
    if (!canvas) {
      console.error("출퇴근 차트 캔버스를 찾을 수 없습니다.");
      return;
    }
    console.log("출퇴근 차트 캔버스 찾음:", canvas);

    // 기존 차트 파괴
    if (attendanceChart) {
      attendanceChart.destroy();
    }

    const ctx = canvas.getContext("2d");

    console.log("출퇴근 통계 확인:", attendanceStats);

    // 출퇴근 데이터 준비 (기본값 포함)
    const normalAttendance = attendanceStats?.normalAttendance ?? 0;
    const late = attendanceStats?.late ?? 0;
    const earlyLeave = attendanceStats?.earlyLeave ?? 0;
    const overtime = attendanceStats?.overtime ?? 0;

    console.log("출퇴근 차트 데이터:", {
      normalAttendance,
      late,
      earlyLeave,
      overtime,
    });

    const data = {
      labels: ["정상근무", "지각", "조퇴", "연장근무"],
      datasets: [
        {
          label: "일수",
          data: [normalAttendance, late, earlyLeave, overtime],
          backgroundColor: [
            "#28a745", // 정상근무 - 초록색
            "#ffc107", // 지각 - 노란색
            "#fd7e14", // 조퇴 - 주황색
            "#6f42c1", // 연장근무 - 보라색
          ],
          borderColor: ["#1e7e34", "#e0a800", "#d35400", "#5a32a3"],
          borderWidth: 1,
        },
      ],
    };

    attendanceChart = new Chart(ctx, {
      type: "doughnut",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false,
          },
          legend: {
            position: "bottom",
            labels: {
              font: { size: 10 },
              padding: 10,
              usePointStyle: true,
            },
          },
          tooltip: {
            titleFont: { size: 11 },
            bodyFont: { size: 10 },
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.parsed;
                const total = attendanceStats.totalDays;
                const percentage =
                  total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: ${value}일 (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  function printReport() {
    if (!evaluationContent) {
      alert("업무평가서를 먼저 생성해주세요.");
      return;
    }

    // 화면 내용을 그대로 유지하면서 프린트용 스타일
    const printStyles = document.createElement("style");
    printStyles.textContent = `
      @media print {
        @page {
          size: A4;
          margin: 15mm;
          -webkit-print-color-adjust: exact;
        }

        /* 프린트시 불필요한 요소만 숨기기 */
        .evaluation-controls,
        .report-actions,
        .admin-tabs,
        .close-button,
        .calendar-view-btn,
        header,
        .main-content > *:not(#admin-panel-modal) {
          display: none !important;
        }

        /* body 스타일 - 화면과 동일하게 */
        body {
          background: #f4f6f8 !important;
          color: #333 !important;
          margin: 0 !important;
          padding: 0 !important;
          font-family: Arial, sans-serif !important;
        }

        /* 모달 배경 제거 */
        #admin-panel-modal {
          position: static !important;
          width: 100% !important;
          height: auto !important;
          max-width: none !important;
          max-height: none !important;
          margin: 0 !important;
          padding: 20px !important;
          border: none !important;
          box-shadow: none !important;
          background: #f4f6f8 !important;
          overflow: visible !important;
        }

        .modal-content {
          position: static !important;
          width: 100% !important;
          height: auto !important;
          max-width: none !important;
          max-height: none !important;
          margin: 0 auto !important;
          padding: 0 !important;
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
          overflow: visible !important;
          border-radius: 0 !important;
        }

        /* 업무평가서 컨테이너 - 화면과 동일한 스타일 유지 */
        #evaluation-content {
          width: 100% !important;
          max-width: none !important;
          margin: 0 auto !important;
          padding: 0 !important;
          background: transparent !important;
          overflow: visible !important;
        }

        /* 평가서 내용 - 화면 스타일 완전히 유지 */
        .evaluation-report {
          background: white !important;
          border-radius: 6px !important;
          overflow: visible !important;
          height: auto !important;
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 20px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid #e9ecef !important;
        }

        /* 헤더 스타일 - 화면과 동일하게 */
        .report-header {
          background: #f8f9fa !important;
          padding: 12px 15px !important;
          border-bottom: 1px solid #dee2e6 !important;
          border-radius: 0 !important;
          margin: -20px -20px 20px -20px !important;
        }

        .report-header h2 {
          margin: 0 0 8px 0 !important;
          color: #212529 !important;
          text-align: center !important;
          font-size: 20px !important;
          font-weight: 600 !important;
        }

        .report-header .meta-info {
          font-size: 14px !important;
          color: #6c757d !important;
          text-align: center !important;
          margin: 0 !important;
        }

        /* 성과 요약 섹션 - 높이 대폭 축소 */
        .performance-summary {
          padding: 4px 8px 2px 8px !important;
          margin: 3px 0 0 0 !important;
        }

        .performance-summary h3 {
          margin: 0 0 2px 0 !important;
          font-size: 11px !important;
          font-weight: 600 !important;
        }

        .summary-grid {
          gap: 4px !important;
          margin: 2px 0 0 0 !important;
        }

        .summary-card {
          padding: 4px 2px !important;
          border-radius: 2px !important;
        }

        .summary-card h4 {
          margin: 0 0 1px 0 !important;
          font-size: 8px !important;
          line-height: 1 !important;
        }

        .summary-value {
          font-size: 13px !important;
          line-height: 1 !important;
        }

        /* 차트 섹션 - 여백 대폭 축소 */
        .performance-charts {
          margin: 3px 0 !important;
          padding: 6px !important;
          border: 1px solid #e9ecef !important;
          border-radius: 3px !important;
          background: #f8f9fa !important;
        }

        .chart-section {
          margin: 6px 0 !important;
          padding: 5px !important;
          background: white !important;
          border-radius: 3px !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.08) !important;
          page-break-inside: avoid;
        }

        .chart-section h3 {
          color: #495057 !important;
          font-size: 12px !important;
          margin: 0 0 5px 0 !important;
          text-align: center !important;
          font-weight: 600 !important;
        }

        /* 차트 크기 - 높이 대폭 축소 */
        .performance-charts canvas {
          max-width: 100% !important;
          width: 100% !important;
          height: auto !important;
          max-height: 120px !important;
          display: block !important;
          margin: 0 auto !important;
        }

        /* 출퇴근 상세 및 통계 - 화면 스타일 유지 */
        .attendance-details,
        .detailed-stats {
          margin: 20px 0 !important;
          padding: 15px !important;
          border: 1px solid #e9ecef !important;
          border-radius: 4px !important;
          background: white !important;
          page-break-inside: avoid;
        }

        .attendance-details h3,
        .detailed-stats h3 {
          color: #495057 !important;
          font-size: 16px !important;
          margin: 0 0 15px 0 !important;
          font-weight: 600 !important;
        }

        /* 테이블 스타일 - 화면과 동일하게 */
        .stats-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 10px 0 !important;
          font-size: 13px !important;
          background: white !important;
        }

        .stats-table th,
        .stats-table td {
          border: 1px solid #dee2e6 !important;
          padding: 8px 12px !important;
          text-align: left !important;
        }

        .stats-table th {
          background-color: #f8f9fa !important;
          font-weight: 600 !important;
          color: #495057 !important;
        }

        .stats-table td {
          background-color: white !important;
          color: #212529 !important;
        }

        /* 제목 스타일 */
        h1, h2, h3, h4 {
          page-break-after: avoid;
          color: #212529 !important;
        }

        /* 페이지 브레이크 최적화 */
        .chart-section,
        .attendance-details,
        .detailed-stats,
        .stats-table {
          page-break-inside: avoid;
        }

        /* 전체 높이 최적화 */
        html, body {
          height: auto !important;
          overflow: visible !important;
        }

        * {
          box-sizing: border-box !important;
        }
      }
    `;

    document.head.appendChild(printStyles);

    // 차트 렌더링 완료를 기다린 후 프린트
    setTimeout(() => {
      window.print();

      // 프린트 대화상자가 닫힌 후 스타일 제거
      setTimeout(() => {
        if (document.head.contains(printStyles)) {
          document.head.removeChild(printStyles);
        }
      }, 1000);
    }, 500);
  }

  // 차트들을 이미지로 캡처하는 함수
  async function captureChartsAsImages() {
    const chartImages = [];

    try {
      // 일일 차트
      if (dailyChart) {
        chartImages.push(dailyChart.toBase64Image("image/png", 1.0));
      }

      // 주간 차트
      if (weeklyChart) {
        chartImages.push(weeklyChart.toBase64Image("image/png", 1.0));
      }

      // 출퇴근 차트
      if (attendanceChart) {
        chartImages.push(attendanceChart.toBase64Image("image/png", 1.0));
      }

      // 직원 비교 차트
      if (staffComparisonChart) {
        chartImages.push(staffComparisonChart.toBase64Image("image/png", 1.0));
      }
    } catch (error) {
      console.error("차트 이미지 캡처 실패:", error);
    }

    return chartImages;
  }

  // switchTab 함수 확장 - evaluation 탭 지원 추가
  const originalSwitchTab = switchTab;
  switchTab = function (tabName) {
    originalSwitchTab(tabName);

    if (tabName === "evaluation") {
      setTimeout(() => {
        initializeEvaluationTab();
      }, 100);
    }
  };

  // 업무평가서 달력 버튼 이벤트 리스너
  const evaluationCalendarBtn = document.getElementById(
    "evaluation-calendar-btn"
  );
  if (evaluationCalendarBtn) {
    evaluationCalendarBtn.addEventListener("click", function () {
      // 현재 업무평가서에서 선택된 직원 정보 가져오기
      const staffSelect = document.getElementById("evaluation-staff");
      const selectedStaffName =
        staffSelect && staffSelect.selectedIndex > 0
          ? staffSelect.options[staffSelect.selectedIndex].textContent
          : null;

      if (!selectedStaffName) {
        alert("직원을 먼저 선택해주세요.");
        return;
      }

      // 새 창에서 달력 페이지 열기 (선택된 직원으로)
      const calendarUrl = `attendance-calendar.html?user=${encodeURIComponent(
        selectedStaffName
      )}`;
      window.open(
        calendarUrl,
        "evaluation-attendance-calendar",
        "width=1200,height=800,scrollbars=yes,resizable=yes"
      );
    });
  }

  // 페이지 로드 시 로그인 상태 확인 (모든 변수 및 함수 선언 후)
  setTimeout(checkLoginStatus, 100);
});
