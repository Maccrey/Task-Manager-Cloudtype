document.addEventListener("DOMContentLoaded", () => {
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
  const assignCorrectorModal = document.getElementById("assign-corrector-modal");
  const assignCorrectorForm = document.getElementById("assign-corrector-form");
  const assignModalTitle = document.getElementById("assign-modal-title");
  const assignTaskInfo = document.getElementById("assign-task-info");
  const assignCorrectorSelect = document.getElementById("assign-corrector-select");
  const assignCancelBtn = document.getElementById("assign-cancel-btn");
  const assignModalCloseButton = assignCorrectorModal.querySelector(".close-button");

  const apiKey =
    "e080d32c1a94808682a5c4fe268ba6f9e5aedf09c936f44ecb51272e59287233";
  const API_URL = "http://192.168.1.25:3000/books";
  const STAFF_API_URL = "http://192.168.1.25:3000/staff";

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

  // 서버 연결 상태 확인
  async function checkServerConnection() {
    try {
      console.log("Checking server connection...");
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        serverStatus = "online";
        console.log("Server is online");
        return true;
      } else {
        serverStatus = "offline";
        console.log("Server responded but not OK:", response.status);
        return false;
      }
    } catch (error) {
      serverStatus = "offline";
      console.warn("Server connection failed:", error.message);
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

  // 데이터 로드 함수
  async function loadTasks() {
    try {
      console.log("Loading tasks from server...");
      updateStatusDisplay();

      const isServerOnline = await checkServerConnection();

      if (isServerOnline) {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            `Server error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        tasks = Array.isArray(data) ? data : [];
        console.log(`Loaded ${tasks.length} tasks from server`);
      } else {
        throw new Error("Server is not available");
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


  // 작업 저장/업데이트 함수
  async function saveTask(task, isNewTask = false) {
    try {
      const method = isNewTask ? "POST" : "PUT";
      const url = isNewTask ? API_URL : `${API_URL}/${task.id}`;

      console.log(`${method} request to:`, url);
      console.log("Task data being sent:", JSON.stringify(task, null, 2));

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
        signal: AbortSignal.timeout(10000), // 10초 타임아웃
      });

      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(
          `Server error: ${response.status} ${response.statusText}. ${errorText}`
        );
      }

      const savedTask = await response.json();
      console.log("Task saved to server:", savedTask);

      return savedTask;
    } catch (error) {
      console.error("Error saving task:", error);
      console.error("Full error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      serverStatus = "offline";
      updateStatusDisplay();
      
      // 네트워크 오류인지 확인
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(`네트워크 연결 실패: ${API_URL}에 접근할 수 없습니다.`);
      }
      
      // 타임아웃 오류인지 확인
      if (error.name === "AbortError") {
        throw new Error("요청 시간 초과: 서버 응답이 너무 오래 걸립니다.");
      }
      
      throw error;
    }
  }

  // 작업 삭제 함수
  async function deleteTask(taskId) {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      console.log("Task deleted from server");

      // 로컬 배열에서도 삭제
      const index = tasks.findIndex((t) => t.id === taskId);
      if (index !== -1) {
        tasks.splice(index, 1);
        console.log("Task deleted locally");
      }

      renderTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
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

  // Staff management functions
  async function loadStaff() {
    try {
      const response = await fetch(STAFF_API_URL);
      if (response.ok) {
        staff = await response.json();
        updateStaffDropdowns();
        updateAssignCorrectorDropdownIfOpen(); // Update assign corrector dropdown if modal is open
        console.log(`Loaded ${staff.length} staff members`);
      } else {
        console.warn('Failed to load staff data');
        staff = [];
      }
    } catch (error) {
      console.error('Error loading staff:', error);
      staff = [];
    }
  }

  async function addStaff(name, role) {
    try {
      const response = await fetch(STAFF_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, role }),
      });
      
      if (response.ok) {
        const newStaff = await response.json();
        staff.push(newStaff);
        updateStaffDropdowns();
        updateAssignCorrectorDropdownIfOpen(); // Update assign corrector dropdown if modal is open
        renderStaffList();
        return newStaff;
      } else {
        throw new Error('Failed to add staff member');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      throw error;
    }
  }

  async function deleteStaff(staffId) {
    try {
      const response = await fetch(`${STAFF_API_URL}/${staffId}`, {
        method: 'DELETE',
      });
      
      if (response.ok || response.status === 404) {
        staff = staff.filter(s => s.id !== staffId);
        updateStaffDropdowns();
        updateAssignCorrectorDropdownIfOpen(); // Update assign corrector dropdown if modal is open
        renderStaffList();
      } else {
        throw new Error('Failed to delete staff member');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      throw error;
    }
  }

  function updateStaffDropdowns() {
    // Get all dropdown elements
    const dropdowns = [
      document.getElementById('corrector1'),
      document.getElementById('corrector2'),
      document.getElementById('corrector3'),
      document.getElementById('transcriber'),
      document.getElementById('corrector1-assigned'),
      document.getElementById('corrector2-assigned'),
      document.getElementById('corrector3-assigned'),
      document.getElementById('transcriber-assigned'),
    ];

    dropdowns.forEach(dropdown => {
      if (dropdown) {
        // Save current value
        const currentValue = dropdown.value;
        
        // Clear existing options except first one
        dropdown.innerHTML = '<option value="">담당자 선택</option>';
        
        // Add staff options based on dropdown type
        const isTranscriber = dropdown.id.includes('transcriber');
        const filteredStaff = staff.filter(s => {
          if (isTranscriber) {
            return s.role === 'transcriber' || s.role === 'both' || s.role === 'admin';
          } else {
            return s.role === 'corrector' || s.role === 'both' || s.role === 'admin';
          }
        });

        filteredStaff.forEach(s => {
          const option = document.createElement('option');
          option.value = s.name;
          option.textContent = s.name;
          dropdown.appendChild(option);
        });

        // Restore previous value if it still exists
        if (currentValue && Array.from(dropdown.options).some(opt => opt.value === currentValue)) {
          dropdown.value = currentValue;
        }
      }
    });
  }

  function renderStaffList() {
    const staffTbody = document.getElementById('staff-tbody');
    if (!staffTbody) return;

    staffTbody.innerHTML = '';

    if (staff.length === 0) {
      staffTbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #666; padding: 20px;">등록된 직원이 없습니다.</td></tr>';
      return;
    }

    staff.forEach(s => {
      const row = document.createElement('tr');
      
      const roleText = {
        'corrector': '교정자',
        'transcriber': '점역자',
        'both': '교정자+점역자',
        'admin': '관리자'
      }[s.role] || s.role;

      const createdDate = new Date(s.createdAt).toLocaleDateString('ko-KR');

      row.innerHTML = `
        <td>${s.name}</td>
        <td>${roleText}</td>
        <td>${createdDate}</td>
        <td>
          <button class="action-btn delete-btn" onclick="handleDeleteStaff('${s.id}')">삭제</button>
        </td>
      `;
      staffTbody.appendChild(row);
    });
  }

  // Debug function to test API connectivity
  window.testAPIConnection = async function() {
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
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...testTask,
              testField: `test-${Date.now()}`
            })
          });
          
          console.log("PUT Response:", putResponse.status, putResponse.statusText);
          
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

  // 초기 로드
  loadTasks();
  loadStaff();
  setTimeout(updateCurrentWorkersDisplay, 1000); // Show current workers after initial load

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
    enableTranscriberCheckbox.checked = false;
    transcriberInput.disabled = true;
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
  });

  completedBooksButton.addEventListener("click", () => {
    openCompletedBooksModal();
  });

  closeButton.addEventListener("click", closeModal);

  // 모달 외부 클릭시 닫기
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
    if (event.target === progressUpdateModal) {
      closeProgressUpdateModal();
    }
    if (event.target === bookSelectionModal) {
      closeBookSelectionModal();
    }
    if (event.target === adminPanelModal) {
      closeAdminPanel();
    }
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

      // 데이터 목록을 다시 로드하여 화면을 갱신
      await loadTasks();

      closeModal();

      alert("새 작업이 등록되었습니다.");
    } catch (error) {
      console.error("Error adding task:", error);
      alert(`작업을 추가하는 데 실패했습니다: ${error.message}`);
    }
  });

  // 작업 목록 렌더링
  function renderTasks() {
    taskList.innerHTML = "";

    // 서버 연결 상태에 따른 메시지 표시
    if (serverStatus === "offline") {
      taskList.innerHTML = 
        '<div style="display: flex; justify-content: center; align-items: center; min-height: 300px; padding: 40px;">' +
        '<div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 30px; max-width: 500px; text-align: center; color: #856404; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
        '<h3 style="margin-top: 0; color: #856404; font-size: 1.3em;">⚠️ 서버 연결 실패</h3>' +
        '<p style="margin: 15px 0; line-height: 1.5;">데이터베이스 서버에 연결할 수 없습니다.</p>' +
        '<p style="margin: 15px 0; line-height: 1.5;">백엔드 서버가 실행 중인지 확인해주세요.</p>' +
        '<div style="background: #f8f9fa; border-radius: 4px; padding: 10px; margin: 15px 0;">' +
        '<p style="font-size: 0.9em; color: #6c757d; margin: 0;">서버 실행 명령어:</p>' +
        '<code style="color: #495057; font-weight: bold;">cd backend && npm start</code>' +
        '</div>' +
        '</div>' +
        '</div>';
      return;
    }

    // 완료된 작업 필터링 - 메인 화면에서는 완료된 작업 제외
    const incompleteTasks = tasks.filter(
      (task) => task.currentStage !== "completed"
    );

    if (incompleteTasks.length === 0) {
      taskList.innerHTML =
        '<div style="display: flex; justify-content: center; align-items: center; min-height: 300px; padding: 40px;">' +
        '<div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 30px; max-width: 500px; text-align: center; color: #6c757d; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
        '<h3 style="margin-top: 0; color: #6c757d; font-size: 1.3em;">📚 작업 목록이 비어있습니다</h3>' +
        '<p style="margin: 15px 0; line-height: 1.5;">현재 진행 중인 작업이 없습니다.</p>' +
        '<p style="margin: 15px 0; line-height: 1.5;">새 도서를 등록하거나 검색하여 작업을 시작하세요.</p>' +
        '</div>' +
        '</div>';
      return;
    }

    incompleteTasks.sort((a, b) => {
      const aHasAssignee =
        a.currentStage !== "completed" &&
        a.stages[a.currentStage] &&
        a.stages[a.currentStage].assignedTo;
      const bHasAssignee =
        b.currentStage !== "completed" &&
        b.stages[b.currentStage] &&
        b.stages[b.currentStage].assignedTo;

      if (aHasAssignee && !bHasAssignee) {
        return -1;
      }
      if (!aHasAssignee && bHasAssignee) {
        return 1;
      }
      return 0;
    });

    incompleteTasks.forEach((task) => {
      const taskItem = document.createElement("div");
      taskItem.classList.add("task-item");

      let currentProgress = 0;
      let currentStageName = "";
      let currentPageForDisplay = 0;

      if (task.currentStage && task.currentStage !== "completed") {
        const stage = task.stages[task.currentStage];
        if (stage && stage.history.length > 0) {
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

      const assignedTo =
        task.currentStage === "completed"
          ? "-"
          : task.stages[task.currentStage]?.assignedTo || "미정";
      const showAssignButton =
        task.currentStage !== "completed" &&
        !task.stages[task.currentStage]?.assignedTo;
      const noteCount = task.notes ? task.notes.length : 0;

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
                <p><strong>${currentStageName} 담당자:</strong> ${assignedTo}
                    ${
                      showAssignButton
                        ? `<button class="assign-corrector-button" data-id="${task.id}" data-stage="${task.currentStage}">지정</button>`
                        : ""
                    }
                </p>
                ${
                  task.currentStage !== "completed"
                    ? `<button data-id="${task.id}" class="update-progress-button">진행 상황 업데이트</button>`
                    : ""
                }
                <button data-id="${
                  task.id
                }" class="delete-task-button">삭제</button>
                <button data-id="${task.id}" class="notes-button ${
        noteCount === 0 ? "inactive" : ""
      }">특이사항 <span class="note-count">${noteCount}</span></button>
                ${
                  assignedTo !== "미정" && task.currentStage !== "completed"
                    ? `<button data-id="${task.id}" class="work-session-button ${
                        currentWorkSessions.has(task.id) ? "stop" : "start"
                      }" data-worker="${assignedTo}">${
                        currentWorkSessions.has(task.id) ? "작업중지" : "작업시작"
                      }</button>`
                    : ""
                }
            `;
      taskList.appendChild(taskItem);
    });
  }

  // 이벤트 위임을 사용하여 taskList에 대한 클릭 이벤트 처리
  taskList.addEventListener("click", (event) => {
    const target = event.target;
    const taskId = target.dataset.id;
    const task = tasks.find((t) => t.id === taskId);

    if (target.classList.contains("update-progress-button")) {
      if (task) {
        openProgressUpdateModal(task);
      }
    } else if (target.classList.contains("delete-task-button")) {
      const password = prompt("작업을 삭제하려면 비밀번호를 입력하세요:");
      if (password === "maccrey") {
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
      const worker = target.dataset.worker;
      if (target.classList.contains("start")) {
        startWorkSession(task, worker);
      } else {
        stopWorkSession(task, worker);
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
    assignCorrectorSelect.innerHTML = '<option value="">담당자를 선택해주세요</option>';
    
    if (staff.length === 0) {
      assignCorrectorSelect.innerHTML = '<option value="">등록된 직원이 없습니다</option>';
      return;
    }

    const isTranscriber = stageKey === 'transcription';
    const filteredStaff = staff.filter(s => {
      if (isTranscriber) {
        return s.role === 'transcriber' || s.role === 'both' || s.role === 'admin';
      } else {
        return s.role === 'corrector' || s.role === 'both' || s.role === 'admin';
      }
    });

    if (filteredStaff.length === 0) {
      const roleText = isTranscriber ? '점역자' : '교정자';
      assignCorrectorSelect.innerHTML = `<option value="">등록된 ${roleText}가 없습니다</option>`;
      return;
    }

    filteredStaff.forEach(s => {
      const option = document.createElement('option');
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
    if (assignCorrectorModal && assignCorrectorModal.style.display === "flex" && currentAssignStage) {
      // Save current selection
      const currentValue = assignCorrectorSelect.value;
      
      // Repopulate dropdown with latest staff data
      populateAssignCorrectorDropdown(currentAssignStage);
      
      // Restore selection if it's still valid
      if (currentValue) {
        const options = Array.from(assignCorrectorSelect.options);
        if (options.some(opt => opt.value === currentValue)) {
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

    const originalAssignedTo = currentAssignTask.stages[currentAssignStage].assignedTo;
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
      currentAssignTask.stages[currentAssignStage].assignedTo = originalAssignedTo;
      alert(`담당자 지정에 실패했습니다: ${error.message}`);
    }
  }

  // 진행 상황 업데이트 모달 열기
  function openProgressUpdateModal(task) {
    currentTaskForUpdate = task;
    const stageKey = task.currentStage;

    if (!stageKey || stageKey === "completed") {
      alert("이미 완료된 작업입니다.");
      return;
    }

    const stageNames = {
      correction1: "1차 교정",
      correction2: "2차 교정",
      correction3: "3차 교정",
      transcription: "점역",
    };

    const stageName = stageNames[stageKey] || stageKey;
    const stage = task.stages[stageKey];
    const assignedTo = stage?.assignedTo;

    if (!assignedTo) {
      // Store the task to continue with progress update after assignment
      window.pendingProgressUpdateTask = task;
      assignCorrectorFromCard(task, stageKey);
      return;
    }

    const lastCompletedPage =
      stage.history.length > 0
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
  }

  // 진행 상황 업데이트 모달 닫기
  function closeProgressUpdateModal() {
    progressUpdateModal.style.display = "none";
    currentTaskForUpdate = null;
  }

  progressModalCloseButton.addEventListener("click", closeProgressUpdateModal);

  // 진행 상황 업데이트 폼 제출
  progressUpdateForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentTaskForUpdate) {
      alert("작업 정보를 찾을 수 없습니다.");
      return;
    }

    const newPage = parseInt(updatePageInput.value);
    let dateTime = updateDatetimeInput.value.trim();

    if (!dateTime) {
      dateTime = new Date().toISOString();
    } else {
      dateTime = new Date(dateTime).toISOString();
    }

    const task = currentTaskForUpdate;
    const stageKey = task.currentStage;
    const stage = task.stages[stageKey];

    if (!stage) {
      alert("현재 단계 정보를 찾을 수 없습니다.");
      return;
    }

    const lastCompletedPage =
      stage.history.length > 0
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

    // 진행 기록 추가
    const startPage = lastCompletedPage + 1;
    const newHistoryEntry = {
      date: new Date(dateTime).toLocaleString("ko-KR"),
      startPage: startPage,
      endPage: newPage,
    };

    // 백업용으로 기존 히스토리 저장
    const originalHistory = [...stage.history];
    const originalStatus = stage.status;

    try {
      stage.history.push(newHistoryEntry);

      // 단계 완료 확인
      if (newPage === task.totalPages) {
        stage.status = "completed";
      }

      console.log("Updating task progress:", {
        taskId: task.id,
        stage: stageKey,
        newPage: newPage,
        isCompleted: newPage === task.totalPages,
      });

      await saveTask(task);

      // Update work session with completed pages if session was just stopped
      if (window.currentStoppedSession && window.currentStoppedSession.taskId === task.id) {
        const sessionIndex = window.currentStoppedSession.sessionIndex;
        if (sessionIndex !== -1 && workSessions[sessionIndex]) {
          workSessions[sessionIndex].endPage = newPage;
          workSessions[sessionIndex].pagesWorked = Math.max(0, newPage - window.currentStoppedSession.startPage);
          saveWorkSessionsToStorage();
          console.log(`Updated session with pages worked: ${workSessions[sessionIndex].pagesWorked}`);
        }
        // Clear the session info
        window.currentStoppedSession = null;
      }

      // 단계 완료 시 다음 단계로 이동
      if (newPage === task.totalPages) {
        const stageNames = {
          correction1: "1차 교정",
          correction2: "2차 교정",
          correction3: "3차 교정",
          transcription: "점역",
        };

        const stageName = stageNames[stageKey];
        alert(
          `${stripHtmlTags(
            task.book.title
          )}의 ${stageName} 단계가 완료되었습니다!`
        );
        await moveToNextStage(task);
      } else {
        renderTasks();
      }

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
      renderTasks();
    } catch (error) {
      console.error("Error moving to next stage:", error);
      console.error("Full error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      
      let errorMessage = "다음 단계로 이동하는 데 실패했습니다: ";
      
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        errorMessage += "서버 연결 실패. 백엔드 서버가 실행 중인지 확인해주세요.";
      } else if (error.name === "AbortError" || error.message.includes("timeout")) {
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
            ${Object.keys(stageNames)
              .map((stageKey) => {
                const stage = task.stages[stageKey];
                if (!stage || stage.status === "not_applicable") return "";

                const stageName = stageNames[stageKey];
                const currentPages =
                  stage.history.length > 0
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

                const historyList = stage.history
                  .map(
                    (entry) =>
                      `<li>${entry.date}: ${entry.startPage}~${entry.endPage} 페이지</li>`
                  )
                  .join("");

                return `
                    <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #eee; border-radius: 4px;">
                        <p><strong>${stageName}</strong></p>
                        <p>담당자: ${stage.assignedTo || "미정"}</p>
                        <p>진행률: ${currentPages} / ${
                  task.totalPages
                } 페이지 (${progressPercent}%)</p>
                        <p>상태: ${statusText}</p>
                        ${
                          historyList
                            ? `<strong>진행 기록:</strong><ul style="margin-top: 5px;">${historyList}</ul>`
                            : '<p style="color: #666;">진행 기록 없음</p>'
                        }
                    </div>
                `;
              })
              .join("")}
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
      const response = await fetch(`${API_URL}/${taskId}/notes`);
      if (!response.ok) {
        throw new Error("특이사항을 불러오는데 실패했습니다.");
      }
      const notes = await response.json();
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        task.notes = notes;
      }
      renderNotes(notes, taskId);
      renderTasks(); // Update note count on the button
    } catch (error) {
      console.error("Error loading notes:", error);
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

    const url = noteId
      ? `${API_URL}/${taskId}/notes/${noteId}`
      : `${API_URL}/${taskId}/notes`;
    const method = noteId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ author, content }),
      });

      if (!response.ok) {
        throw new Error("특이사항 저장에 실패했습니다.");
      }

      noteForm.reset();
      noteIdInput.value = "";
      loadAndRenderNotes(taskId);
    } catch (error) {
      console.error("Error saving note:", error);
      alert(error.message);
    }
  });

  async function deleteNote(taskId, noteId) {
    try {
      const response = await fetch(`${API_URL}/${taskId}/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("특이사항 삭제에 실패했습니다.");
      }

      loadAndRenderNotes(taskId);
    } catch (error) {
      console.error("Error deleting note:", error);
      alert(error.message);
    }
  }

  notesModalCloseButton.addEventListener("click", closeNotesModal);

  // 도서 선택 모달 닫기 버튼 이벤트
  bookSelectionCloseButton.addEventListener("click", closeBookSelectionModal);

  // 관리자 모드 기능
  function authenticateAdmin() {
    console.log('Admin button clicked');
    openPasswordModal();
  }

  function openPasswordModal() {
    console.log('Opening password modal');
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
    console.log('Password submitted:', password);

    if (password === "maccrey") {
      console.log('Password correct, opening admin panel');
      isAdminMode = true;
      closePasswordModal();
      openAdminPanel();
    } else {
      console.log('Password incorrect');
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
    switchTab("tasks");
    loadAdminData();
  }

  function closeAdminPanel() {
    adminPanelModal.style.display = "none";
    isAdminMode = false;
    currentEditingRow = null;
  }

  function switchTab(tabName) {
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
  }

  async function loadAdminData() {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        tasks = await response.json();
        loadAdminTasks();
        loadDataInfo();
        loadStatistics();
      }
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
      corrector1: "1차 교정",
      corrector2: "2차 교정",
      corrector3: "3차 교정",
      transcriber: "점역",
    };
    return stageNames[stage] || stage;
  }

  function loadDataInfo() {
    const dataInfo = document.getElementById("data-info");
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

  // 데이터 관리 기능
  function backupData() {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `bookworklist_backup_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert("데이터가 백업되었습니다.");
  }

  function restoreData() {
    document.getElementById("restore-file-input").click();
  }

  async function handleRestore(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      if (
        confirm(
          `${backupData.length}개의 작업을 복원하시겠습니까? 현재 데이터는 모두 삭제됩니다.`
        )
      ) {
        // 기존 데이터 삭제
        await clearAllData(false);

        // 백업 데이터 복원
        for (const task of backupData) {
          await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
          });
        }

        await loadTasks();
        loadAdminData();
        alert("데이터가 성공적으로 복원되었습니다.");
      }
    } catch (error) {
      alert("복원 실패: 올바른 백업 파일이 아닙니다.");
    }

    event.target.value = "";
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
  console.log('adminModeButton:', adminModeButton);
  console.log('passwordModal:', passwordModal);
  console.log('passwordForm:', passwordForm);
  
  if (adminModeButton) {
    adminModeButton.addEventListener("click", authenticateAdmin);
    console.log('Admin button event listener added');
  } else {
    console.error('Admin mode button not found!');
  }
  adminPanelCloseButton.addEventListener("click", closeAdminPanel);

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // 데이터 관리 버튼들
  document
    .getElementById("backup-data-btn")
    .addEventListener("click", backupData);
  document
    .getElementById("restore-data-btn")
    .addEventListener("click", restoreData);
  document
    .getElementById("clear-all-data-btn")
    .addEventListener("click", () => clearAllData(true));
  document
    .getElementById("restore-file-input")
    .addEventListener("change", handleRestore);

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
        if (currentValue && Array.from(assignedSelect.options).some(opt => opt.value === currentValue)) {
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
          const date = new Date(entry.date).toLocaleString("ko-KR");
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

  // 출퇴근 기록 이벤트 리스너들
  document.getElementById('attendance-year')?.addEventListener('change', renderAttendanceTable);
  document.getElementById('attendance-month')?.addEventListener('change', renderAttendanceTable);
  document.getElementById('attendance-date')?.addEventListener('change', renderAttendanceTable);
  document.getElementById('attendance-worker')?.addEventListener('change', renderAttendanceTable);
  document.getElementById('refresh-attendance-btn')?.addEventListener('click', loadAttendanceData);
  document.getElementById('export-attendance-btn')?.addEventListener('click', exportAttendanceRecords);
  
  // 직원 관리 이벤트 리스너들
  const staffForm = document.getElementById('staff-form');
  if (staffForm) {
    staffForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('staff-name');
      const roleSelect = document.getElementById('staff-role');
      
      const name = nameInput.value.trim();
      const role = roleSelect.value;
      
      if (!name) {
        alert('직원 이름을 입력해주세요.');
        return;
      }
      
      // 중복 이름 체크
      if (staff.some(s => s.name === name)) {
        alert('이미 등록된 직원입니다.');
        return;
      }
      
      try {
        await addStaff(name, role);
        nameInput.value = '';
        roleSelect.value = 'corrector';
        alert('직원이 성공적으로 등록되었습니다.');
      } catch (error) {
        alert('직원 등록에 실패했습니다: ' + error.message);
      }
    });
  }

  // Work Session Management Functions
  function startWorkSession(task, worker) {
    // Check if worker is already working on another task
    for (const [taskId, session] of currentWorkSessions) {
      if (session.worker === worker && session.isWorking) {
        if (confirm(`${worker}님이 이미 다른 작업(작업 ID: ${taskId})을 진행 중입니다. 기존 작업을 중지하고 새 작업을 시작하시겠습니까?`)) {
          const existingTask = tasks.find(t => t.id === taskId);
          if (existingTask) {
            stopWorkSession(existingTask, worker, false); // Don't show progress modal
          }
        } else {
          return;
        }
      }
    }

    const startTime = new Date();
    currentWorkSessions.set(task.id, {
      startTime: startTime,
      worker: worker,
      isWorking: true,
      taskTitle: task.book.title,
      stage: task.currentStage
    });

    // Save to work sessions history
    const sessionId = `${task.id}_${worker}_${startTime.getTime()}`;
    const workSession = {
      id: sessionId,
      taskId: task.id,
      taskTitle: task.book.title,
      worker: worker,
      stage: task.currentStage,
      startTime: startTime.toISOString(),
      endTime: null,
      isCompleted: false
    };
    
    workSessions.push(workSession);
    saveWorkSessionsToStorage();
    
    renderTasks();
    updateCurrentWorkersDisplay();
    
    console.log(`Work session started for ${worker} on task ${task.id}`);
  }

  function stopWorkSession(task, worker, showProgressModal = true) {
    const sessionData = currentWorkSessions.get(task.id);
    if (!sessionData || sessionData.worker !== worker) {
      alert('작업 세션 정보를 찾을 수 없습니다.');
      return;
    }

    const endTime = new Date();
    const duration = Math.round((endTime - sessionData.startTime) / 1000 / 60); // minutes

    // Get current progress before stopping session
    const currentStage = task.stages[task.currentStage];
    const startPage = currentStage && currentStage.history.length > 0 
      ? currentStage.history[currentStage.history.length - 1].endPage 
      : 0;

    // Update work session history
    const sessionId = `${task.id}_${worker}_${sessionData.startTime.getTime()}`;
    const sessionIndex = workSessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      workSessions[sessionIndex].endTime = endTime.toISOString();
      workSessions[sessionIndex].duration = duration;
      workSessions[sessionIndex].startPage = startPage;
      // endPage will be updated after progress update
    }

    currentWorkSessions.delete(task.id);
    saveWorkSessionsToStorage();
    
    renderTasks();
    updateCurrentWorkersDisplay();
    
    console.log(`Work session stopped for ${worker} on task ${task.id}, duration: ${duration} minutes`);
    
    // Show progress update modal if requested
    if (showProgressModal) {
      // Store current session info for progress update
      window.currentStoppedSession = {
        sessionIndex,
        taskId: task.id,
        worker,
        startPage
      };
      
      setTimeout(() => {
        openProgressUpdateModal(task);
      }, 100);
    }
  }

  function saveWorkSessionsToStorage() {
    try {
      const data = {
        currentSessions: Array.from(currentWorkSessions.entries()).map(([taskId, session]) => ({
          taskId,
          startTime: session.startTime.toISOString(),
          worker: session.worker,
          taskTitle: session.taskTitle,
          stage: session.stage
        })),
        sessions: workSessions
      };
      localStorage.setItem('workSessions', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving work sessions:', error);
    }
  }

  function loadWorkSessionsFromStorage() {
    try {
      const data = localStorage.getItem('workSessions');
      if (data) {
        const parsed = JSON.parse(data);
        
        // Load work sessions history
        workSessions = parsed.sessions || [];
        
        // Load current sessions
        if (parsed.currentSessions) {
          currentWorkSessions.clear();
          parsed.currentSessions.forEach(session => {
            currentWorkSessions.set(session.taskId, {
              startTime: new Date(session.startTime),
              worker: session.worker,
              isWorking: true,
              taskTitle: session.taskTitle,
              stage: session.stage
            });
          });
        }
      }
    } catch (error) {
      console.error('Error loading work sessions:', error);
      currentWorkSessions.clear();
      workSessions = [];
    }
  }

  function updateCurrentWorkersDisplay() {
    let currentWorkersDiv = document.getElementById('current-workers-display');
    if (!currentWorkersDiv) {
      // Create the display element
      const header = document.querySelector('header');
      const dashboardTitle = header.querySelector('h1');
      
      currentWorkersDiv = document.createElement('div');
      currentWorkersDiv.id = 'current-workers-display';
      currentWorkersDiv.style.cssText = `
        background: #e8f5e8;
        border: 1px solid #4CAF50;
        border-radius: 8px;
        margin: 10px 0;
        padding: 10px;
        font-size: 0.9em;
      `;
      
      header.insertBefore(currentWorkersDiv, dashboardTitle.nextSibling);
      
      // Add click handler for debugging
      currentWorkersDiv.addEventListener('click', () => {
        console.log('Current work sessions debug:', {
          size: currentWorkSessions.size,
          entries: Array.from(currentWorkSessions.entries()),
          raw: currentWorkSessions
        });
      });
    }
    
    if (currentWorkSessions.size === 0) {
      currentWorkersDiv.innerHTML = '<div style="text-align: center; color: #666;">현재 작업 중인 담당자가 없습니다.</div>';
      return;
    }
    
    const workersHtml = Array.from(currentWorkSessions.entries()).map(([taskId, session]) => {
      const duration = Math.round((new Date() - session.startTime) / 1000 / 60);
      const stageNames = {
        correction1: '1차 교정',
        correction2: '2차 교정', 
        correction3: '3차 교정',
        transcription: '점역'
      };
      const stageName = stageNames[session.stage] || session.stage;
      
      const workerName = session.worker || 'Unknown';
      
      return `
        <div style="display: inline-block; background: white; padding: 5px 10px; margin: 2px; border-radius: 20px; border: 1px solid #4CAF50; color: #333;">
          <strong style="color: #2e7d32;">${workerName}</strong> - ${stageName} (작업시간: ${duration}분)
        </div>
      `;
    }).join('');
    
    currentWorkersDiv.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">현재 작업 중 (${currentWorkSessions.size}명)</div>
      <div>${workersHtml}</div>
    `;
  }

  // Attendance Management Functions
  function calculateAttendanceRecords() {
    const attendanceRecords = new Map(); // worker -> date -> { startTime, endTime, workSessions, tasks }
    
    workSessions.forEach(session => {
      if (!session.startTime || !session.endTime) return;
      
      const startDate = new Date(session.startTime).toDateString();
      const worker = session.worker;
      
      if (!attendanceRecords.has(worker)) {
        attendanceRecords.set(worker, new Map());
      }
      
      const workerRecords = attendanceRecords.get(worker);
      if (!workerRecords.has(startDate)) {
        workerRecords.set(startDate, {
          startTime: new Date(session.startTime),
          endTime: new Date(session.endTime),
          workSessions: [],
          tasks: new Set()
        });
      }
      
      const dayRecord = workerRecords.get(startDate);
      dayRecord.workSessions.push(session);
      dayRecord.tasks.add(session.taskTitle);
      
      // Update start/end times for the day
      const sessionStart = new Date(session.startTime);
      const sessionEnd = new Date(session.endTime);
      
      if (sessionStart < dayRecord.startTime) {
        dayRecord.startTime = sessionStart;
      }
      if (sessionEnd > dayRecord.endTime) {
        dayRecord.endTime = sessionEnd;
      }
    });
    
    return attendanceRecords;
  }
  
  function loadAttendanceData() {
    const attendanceYear = document.getElementById('attendance-year');
    const attendanceMonth = document.getElementById('attendance-month');
    const attendanceDate = document.getElementById('attendance-date');
    const attendanceWorker = document.getElementById('attendance-worker');
    
    // Populate year dropdown with available years
    populateYearDropdown();
    
    // Set current year and month as default
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    
    if (attendanceYear && !attendanceYear.value) {
      attendanceYear.value = currentYear;
    }
    if (attendanceMonth && !attendanceMonth.value) {
      attendanceMonth.value = currentMonth;
    }
    
    // Populate worker dropdown
    attendanceWorker.innerHTML = '<option value="">모든 직원</option>';
    const uniqueWorkers = [...new Set(workSessions.map(s => s.worker))].filter(w => w);
    uniqueWorkers.forEach(worker => {
      const option = document.createElement('option');
      option.value = worker;
      option.textContent = worker;
      attendanceWorker.appendChild(option);
    });
    
    renderAttendanceSummary();
    renderAttendanceTable();
  }
  
  function populateYearDropdown() {
    const attendanceYear = document.getElementById('attendance-year');
    if (!attendanceYear) return;
    
    // Get unique years from work sessions
    const years = new Set();
    workSessions.forEach(session => {
      if (session.startTime) {
        const year = new Date(session.startTime).getFullYear();
        years.add(year);
      }
    });
    
    // Add current year if not present
    years.add(new Date().getFullYear());
    
    // Clear and populate year dropdown
    attendanceYear.innerHTML = '<option value="">전체 연도</option>';
    
    // Sort years in descending order
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    sortedYears.forEach(year => {
      const option = document.createElement('option');
      option.value = year.toString();
      option.textContent = `${year}년`;
      attendanceYear.appendChild(option);
    });
  }
  
  function renderAttendanceSummary() {
    const today = new Date().toDateString();
    const attendanceRecords = calculateAttendanceRecords();
    const summaryContent = document.getElementById('attendance-summary-content');
    
    let todayWorkers = [];
    attendanceRecords.forEach((workerDays, worker) => {
      if (workerDays.has(today)) {
        const todayRecord = workerDays.get(today);
        const workTime = Math.round((todayRecord.endTime - todayRecord.startTime) / 1000 / 60); // minutes
        
        // Calculate total pages worked today for this worker
        let totalPagesWorked = 0;
        const taskProgress = new Map(); // taskId -> { title, pagesWorked }
        
        todayRecord.workSessions.forEach(session => {
          if (session.taskId && session.pagesWorked > 0) {
            // Use directly stored pages worked from session
            totalPagesWorked += session.pagesWorked;
            
            const task = tasks.find(t => t.id === session.taskId);
            if (task) {
              const taskKey = session.taskId;
              if (!taskProgress.has(taskKey)) {
                taskProgress.set(taskKey, {
                  title: task.book.title,
                  pagesWorked: 0
                });
              }
              taskProgress.get(taskKey).pagesWorked += session.pagesWorked;
            }
          } else if (session.taskId) {
            // Fallback to old method if pagesWorked not available
            const task = tasks.find(t => t.id === session.taskId);
            if (task && task.stages && task.stages[session.stage]) {
              const stage = task.stages[session.stage];
              if (stage.history && stage.history.length > 0) {
                const sessionStart = new Date(session.startTime);
                const sessionEnd = new Date(session.endTime);
                
                let sessionPages = 0;
                stage.history.forEach(entry => {
                  const entryDate = new Date(entry.date);
                  if (entryDate >= sessionStart && entryDate <= sessionEnd) {
                    const pagesInEntry = entry.endPage - entry.startPage + 1;
                    sessionPages += pagesInEntry;
                    totalPagesWorked += pagesInEntry;
                  }
                });
                
                if (sessionPages > 0) {
                  const taskKey = session.taskId;
                  if (!taskProgress.has(taskKey)) {
                    taskProgress.set(taskKey, {
                      title: task.book.title,
                      pagesWorked: 0
                    });
                  }
                  taskProgress.get(taskKey).pagesWorked += sessionPages;
                }
              }
            }
          }
        });
        
        todayWorkers.push({
          worker,
          startTime: todayRecord.startTime,
          endTime: todayRecord.endTime,
          workTime,
          tasks: Array.from(todayRecord.tasks),
          totalPagesWorked,
          taskProgress: Array.from(taskProgress.values())
        });
      }
    });
    
    if (todayWorkers.length === 0) {
      summaryContent.innerHTML = '<p>오늘 출근 기록이 없습니다.</p>';
      return;
    }
    
    const summaryHtml = todayWorkers.map(record => {
      const hours = Math.floor(record.workTime / 60);
      const minutes = record.workTime % 60;
      
      // Create detailed task progress string
      let taskProgressStr = '';
      if (record.taskProgress.length > 0) {
        taskProgressStr = record.taskProgress.map(tp => 
          `${tp.title} (${tp.pagesWorked}페이지)`
        ).join(', ');
      } else {
        taskProgressStr = record.tasks.join(', ');
      }
      
      return `
        <div class="attendance-summary-item">
          <strong>${record.worker}</strong> - 
          출근: ${record.startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}, 
          퇴근: ${record.endTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}, 
          근무시간: ${hours}시간 ${minutes}분
          ${record.totalPagesWorked > 0 ? `<br><span style="color: #28a745; font-weight: bold;">총 작업 페이지: ${record.totalPagesWorked}페이지</span>` : ''}
          <br><small>작업: ${taskProgressStr}</small>
        </div>
      `;
    }).join('');
    
    summaryContent.innerHTML = summaryHtml;
  }
  
  function renderAttendanceTable() {
    const attendanceYear = document.getElementById('attendance-year');
    const attendanceMonth = document.getElementById('attendance-month');
    const attendanceDate = document.getElementById('attendance-date');
    const attendanceWorker = document.getElementById('attendance-worker');
    const attendanceTbody = document.getElementById('attendance-tbody');
    
    const selectedYear = attendanceYear?.value;
    const selectedMonth = attendanceMonth?.value;
    const selectedDate = attendanceDate?.value;
    const selectedWorker = attendanceWorker?.value;
    
    const attendanceRecords = calculateAttendanceRecords();
    const tableData = [];
    
    attendanceRecords.forEach((workerDays, worker) => {
      if (selectedWorker && worker !== selectedWorker) return;
      
      workerDays.forEach((dayRecord, dateStr) => {
        const recordDate = new Date(dateStr);
        
        // Apply date filters
        if (selectedDate) {
          // Specific date filter takes priority
          const filterDate = new Date(selectedDate);
          if (recordDate.toDateString() !== filterDate.toDateString()) return;
        } else {
          // Year and month filters
          if (selectedYear) {
            if (recordDate.getFullYear().toString() !== selectedYear) return;
          }
          if (selectedMonth) {
            const recordMonth = (recordDate.getMonth() + 1).toString().padStart(2, '0');
            if (recordMonth !== selectedMonth) return;
          }
        }
        
        const workTime = Math.round((dayRecord.endTime - dayRecord.startTime) / 1000 / 60);
        const hours = Math.floor(workTime / 60);
        const minutes = workTime % 60;
        
        // Calculate pages worked for this day
        let totalPagesWorked = 0;
        const taskProgress = new Map(); // taskId -> { title, pagesWorked }
        
        dayRecord.workSessions.forEach(session => {
          if (session.taskId && session.pagesWorked > 0) {
            // Use directly stored pages worked from session
            totalPagesWorked += session.pagesWorked;
            
            const task = tasks.find(t => t.id === session.taskId);
            if (task) {
              const taskKey = session.taskId;
              if (!taskProgress.has(taskKey)) {
                taskProgress.set(taskKey, {
                  title: task.book.title,
                  pagesWorked: 0
                });
              }
              taskProgress.get(taskKey).pagesWorked += session.pagesWorked;
            }
          } else if (session.taskId) {
            // Fallback to old method if pagesWorked not available
            const task = tasks.find(t => t.id === session.taskId);
            if (task && task.stages && task.stages[session.stage]) {
              const stage = task.stages[session.stage];
              if (stage.history && stage.history.length > 0) {
                const sessionStart = new Date(session.startTime);
                const sessionEnd = new Date(session.endTime);
                
                let sessionPages = 0;
                stage.history.forEach(entry => {
                  const entryDate = new Date(entry.date);
                  if (entryDate >= sessionStart && entryDate <= sessionEnd) {
                    const pagesInEntry = entry.endPage - entry.startPage + 1;
                    sessionPages += pagesInEntry;
                    totalPagesWorked += pagesInEntry;
                  }
                });
                
                if (sessionPages > 0) {
                  const taskKey = session.taskId;
                  if (!taskProgress.has(taskKey)) {
                    taskProgress.set(taskKey, {
                      title: task.book.title,
                      pagesWorked: 0
                    });
                  }
                  taskProgress.get(taskKey).pagesWorked += sessionPages;
                }
              }
            }
          }
        });
        
        // Create task progress string with page counts
        let taskProgressStr = '';
        if (taskProgress.size > 0) {
          taskProgressStr = Array.from(taskProgress.values()).map(tp => 
            `${tp.title} (${tp.pagesWorked}페이지)`
          ).join(', ');
        } else {
          taskProgressStr = Array.from(dayRecord.tasks).join(', ');
        }
        
        tableData.push({
          date: recordDate,
          worker,
          startTime: dayRecord.startTime,
          endTime: dayRecord.endTime,
          workTime: `${hours}시간 ${minutes}분`,
          tasks: Array.from(dayRecord.tasks),
          taskProgressStr,
          totalPagesWorked
        });
      });
    });
    
    // Sort by date and then by worker
    tableData.sort((a, b) => {
      const dateCompare = b.date - a.date; // Latest first
      if (dateCompare !== 0) return dateCompare;
      return a.worker.localeCompare(b.worker);
    });
    
    if (tableData.length === 0) {
      attendanceTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666; padding: 20px;">출근 기록이 없습니다.</td></tr>';
      return;
    }
    
    const tableHtml = tableData.map(record => {
      return `
        <tr>
          <td>${record.date.toLocaleDateString('ko-KR')}</td>
          <td>${record.worker}</td>
          <td>${record.startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</td>
          <td>${record.endTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</td>
          <td>${record.workTime}</td>
          <td>
            <small>${record.taskProgressStr}</small>
            ${record.totalPagesWorked > 0 ? `<br><span style="color: #28a745; font-weight: bold; font-size: 0.8em;">총 ${record.totalPagesWorked}페이지 작업</span>` : ''}
          </td>
        </tr>
      `;
    }).join('');
    
    attendanceTbody.innerHTML = tableHtml;
  }
  
  function exportAttendanceRecords() {
    const attendanceYear = document.getElementById('attendance-year');
    const attendanceMonth = document.getElementById('attendance-month');
    const attendanceDate = document.getElementById('attendance-date');
    const attendanceWorker = document.getElementById('attendance-worker');
    
    const selectedYear = attendanceYear?.value;
    const selectedMonth = attendanceMonth?.value;
    const selectedDate = attendanceDate?.value;
    const selectedWorker = attendanceWorker?.value;
    
    const attendanceRecords = calculateAttendanceRecords();
    const csvData = [];
    
    // Header
    csvData.push(['날짜', '직원', '출근시간', '퇴근시간', '근무시간', '작업페이지수', '작업내용'].join(','));
    
    const exportData = [];
    attendanceRecords.forEach((workerDays, worker) => {
      if (selectedWorker && worker !== selectedWorker) return;
      
      workerDays.forEach((dayRecord, dateStr) => {
        const recordDate = new Date(dateStr);
        
        // Apply same date filters as table
        if (selectedDate) {
          const filterDate = new Date(selectedDate);
          if (recordDate.toDateString() !== filterDate.toDateString()) return;
        } else {
          if (selectedYear) {
            if (recordDate.getFullYear().toString() !== selectedYear) return;
          }
          if (selectedMonth) {
            const recordMonth = (recordDate.getMonth() + 1).toString().padStart(2, '0');
            if (recordMonth !== selectedMonth) return;
          }
        }
        
        const workTime = Math.round((dayRecord.endTime - dayRecord.startTime) / 1000 / 60);
        const hours = Math.floor(workTime / 60);
        const minutes = workTime % 60;
        
        // Calculate pages worked for export
        let totalPagesWorked = 0;
        const taskProgress = new Map();
        
        dayRecord.workSessions.forEach(session => {
          if (session.taskId && session.pagesWorked > 0) {
            // Use directly stored pages worked from session
            totalPagesWorked += session.pagesWorked;
            
            const task = tasks.find(t => t.id === session.taskId);
            if (task) {
              const taskKey = session.taskId;
              if (!taskProgress.has(taskKey)) {
                taskProgress.set(taskKey, {
                  title: task.book.title,
                  pagesWorked: 0
                });
              }
              taskProgress.get(taskKey).pagesWorked += session.pagesWorked;
            }
          } else if (session.taskId) {
            // Fallback to old method if pagesWorked not available
            const task = tasks.find(t => t.id === session.taskId);
            if (task && task.stages && task.stages[session.stage]) {
              const stage = task.stages[session.stage];
              if (stage.history && stage.history.length > 0) {
                const sessionStart = new Date(session.startTime);
                const sessionEnd = new Date(session.endTime);
                
                let sessionPages = 0;
                stage.history.forEach(entry => {
                  const entryDate = new Date(entry.date);
                  if (entryDate >= sessionStart && entryDate <= sessionEnd) {
                    const pagesInEntry = entry.endPage - entry.startPage + 1;
                    sessionPages += pagesInEntry;
                    totalPagesWorked += pagesInEntry;
                  }
                });
                
                if (sessionPages > 0) {
                  const taskKey = session.taskId;
                  if (!taskProgress.has(taskKey)) {
                    taskProgress.set(taskKey, {
                      title: task.book.title,
                      pagesWorked: 0
                    });
                  }
                  taskProgress.get(taskKey).pagesWorked += sessionPages;
                }
              }
            }
          }
        });
        
        let taskProgressStr = '';
        if (taskProgress.size > 0) {
          taskProgressStr = Array.from(taskProgress.values()).map(tp => 
            `${stripHtmlTags(tp.title)} (${tp.pagesWorked}페이지)`
          ).join(', ');
        } else {
          taskProgressStr = Array.from(dayRecord.tasks).map(title => stripHtmlTags(title)).join(', ');
        }
        
        exportData.push({
          date: recordDate,
          worker: stripHtmlTags(worker),
          startTime: dayRecord.startTime,
          endTime: dayRecord.endTime,
          workTime: `${hours}시간 ${minutes}분`,
          totalPagesWorked,
          tasks: taskProgressStr
        });
      });
    });
    
    // Sort by date desc
    exportData.sort((a, b) => b.date - a.date);
    
    exportData.forEach(record => {
      csvData.push([
        record.date.toLocaleDateString('ko-KR'),
        `"${record.worker}"`,
        record.startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        record.endTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        record.workTime,
        `${record.totalPagesWorked}페이지`,
        `"${record.tasks}"`
      ].join(','));
    });
    
    const blob = new Blob(["\ufeff" + csvData.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_records_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('출근 기록이 CSV 파일로 내보내졌습니다.');
  }
  
  // Load work sessions on startup
  loadWorkSessionsFromStorage();
  
  // Update current workers display periodically
  setInterval(updateCurrentWorkersDisplay, 60000); // Update every minute

  // 전역 함수들
  window.handleDeleteStaff = async function(staffId) {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return;
    
    if (confirm(`'${staffMember.name}' 직원을 삭제하시겠습니까?`)) {
      try {
        await deleteStaff(staffId);
        alert('직원이 삭제되었습니다.');
      } catch (error) {
        alert('직원 삭제에 실패했습니다: ' + error.message);
      }
    }
  };
});
