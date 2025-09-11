const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const app = express();
//const PORT = 3000;
const PORT = process.env.PORT || 3005;
const DATA_FILE = path.join(__dirname, "bookworklist.json");
const STAFF_FILE = path.join(__dirname, "staff.json");
const WORK_SESSIONS_FILE = path.join(__dirname, "work-sessions.json");
const WORK_SESSIONS_HISTORY_FILE = path.join(
  __dirname,
  "work-sessions-history.json"
);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Helper function to read books
const readBooks = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading bookworklist.json:", error);
    return [];
  }
};

// Helper function to write books
const writeBooks = (books) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to bookworklist.json:", error);
  }
};

// Helper function to read staff
const readStaff = () => {
  try {
    if (!fs.existsSync(STAFF_FILE)) {
      return [];
    }
    const data = fs.readFileSync(STAFF_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading staff.json:", error);
    return [];
  }
};

// Helper function to write staff
const writeStaff = (staff) => {
  try {
    fs.writeFileSync(STAFF_FILE, JSON.stringify(staff, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to staff.json:", error);
  }
};

// Helper function to read work sessions
const readWorkSessions = () => {
  try {
    if (!fs.existsSync(WORK_SESSIONS_FILE)) {
      return {};
    }
    const data = fs.readFileSync(WORK_SESSIONS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading work-sessions.json:", error);
    return {};
  }
};

// Helper function to write work sessions
const writeWorkSessions = (sessions) => {
  try {
    fs.writeFileSync(
      WORK_SESSIONS_FILE,
      JSON.stringify(sessions, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("Error writing to work-sessions.json:", error);
  }
};

// Helper function to read work sessions history
const readWorkSessionsHistory = () => {
  try {
    if (!fs.existsSync(WORK_SESSIONS_HISTORY_FILE)) {
      return [];
    }
    const data = fs.readFileSync(WORK_SESSIONS_HISTORY_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading work-sessions-history.json:", error);
    return [];
  }
};

// Helper function to write work sessions history
const writeWorkSessionsHistory = (history) => {
  try {
    fs.writeFileSync(
      WORK_SESSIONS_HISTORY_FILE,
      JSON.stringify(history, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("Error writing to work-sessions-history.json:", error);
  }
};

// GET all books
app.get("/books", (req, res) => {
  const books = readBooks();
  res.json(books);
});

// POST a new book
app.post("/books", (req, res) => {
  console.log("POST /books received");
  console.log("Request body:", req.body);
  const books = readBooks();
  const newBook = { id: Date.now().toString(), ...req.body }; // Simple ID generation
  books.push(newBook);
  writeBooks(books);

  // Broadcast the new book to all connected clients
  broadcast({
    type: "book_added",
    data: newBook,
  });

  res.status(201).json(newBook);
});

// PUT (update) a book
app.put("/books/:id", (req, res) => {
  const books = readBooks();
  const { id } = req.params;
  const updatedBookData = req.body;
  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books[index] = { ...books[index], ...updatedBookData };
    writeBooks(books);

    // Broadcast the updated book to all connected clients
    broadcast({
      type: "book_updated",
      data: books[index],
    });

    res.json(books[index]);
  } else {
    res.status(404).send("Book not found");
  }
});

// DELETE a book
app.delete("/books/:id", (req, res) => {
  let books = readBooks();
  const { id } = req.params;
  const initialLength = books.length;
  books = books.filter((book) => book.id !== id);

  if (books.length < initialLength) {
    writeBooks(books);

    // Broadcast the book deletion to all connected clients
    broadcast({
      type: "book_deleted",
      data: { id },
    });

    res.status(204).send(); // No content
  } else {
    res.status(404).send("Book not found");
  }
});

// Note-related endpoints

// GET all notes for a book
app.get("/books/:id/notes", (req, res) => {
  const books = readBooks();
  const { id } = req.params;
  const book = books.find((book) => book.id === id);

  if (book) {
    res.json(book.notes || []);
  } else {
    res.status(404).send("Book not found");
  }
});

// POST a new note to a book
app.post("/books/:id/notes", (req, res) => {
  const books = readBooks();
  const { id } = req.params;
  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    const newNote = {
      noteId: Date.now().toString(),
      author: req.body.author,
      content: req.body.content,
      createdAt: new Date().toISOString(),
    };

    if (!books[index].notes) {
      books[index].notes = [];
    }
    books[index].notes.push(newNote);
    writeBooks(books);

    // Broadcast the new note to all connected clients
    broadcast({
      type: "note_added",
      data: {
        bookId: id,
        note: newNote,
      },
    });

    res.status(201).json(newNote);
  } else {
    res.status(404).send("Book not found");
  }
});

// PUT (update) a note
app.put("/books/:id/notes/:noteId", (req, res) => {
  const books = readBooks();
  const { id, noteId } = req.params;
  const bookIndex = books.findIndex((book) => book.id === id);

  if (bookIndex !== -1 && books[bookIndex].notes) {
    const noteIndex = books[bookIndex].notes.findIndex(
      (note) => note.noteId === noteId
    );

    if (noteIndex !== -1) {
      books[bookIndex].notes[noteIndex] = {
        ...books[bookIndex].notes[noteIndex],
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      writeBooks(books);

      // Broadcast the updated note to all connected clients
      broadcast({
        type: "note_updated",
        data: {
          bookId: id,
          note: books[bookIndex].notes[noteIndex],
        },
      });

      res.json(books[bookIndex].notes[noteIndex]);
    } else {
      res.status(404).send("Note not found");
    }
  } else {
    res.status(404).send("Book not found");
  }
});

// DELETE a note
app.delete("/books/:id/notes/:noteId", (req, res) => {
  const books = readBooks();
  const { id, noteId } = req.params;
  const bookIndex = books.findIndex((book) => book.id === id);

  if (bookIndex !== -1 && books[bookIndex].notes) {
    const initialLength = books[bookIndex].notes.length;
    books[bookIndex].notes = books[bookIndex].notes.filter(
      (note) => note.noteId !== noteId
    );

    if (books[bookIndex].notes.length < initialLength) {
      writeBooks(books);

      // Broadcast the note deletion to all connected clients
      broadcast({
        type: "note_deleted",
        data: {
          bookId: id,
          noteId: noteId,
        },
      });

      res.status(204).send();
    } else {
      res.status(404).send("Note not found");
    }
  } else {
    res.status(404).send("Book not found");
  }
});

// Staff-related endpoints

// GET all staff
app.get("/staff", (req, res) => {
  const staff = readStaff();
  res.json(staff);
});

// POST a new staff member
app.post("/staff", (req, res) => {
  const staff = readStaff();
  const newStaff = {
    id: Date.now().toString(),
    name: req.body.name,
    role: req.body.role,
    createdAt: new Date().toISOString(),
  };
  staff.push(newStaff);
  writeStaff(staff);
  res.status(201).json(newStaff);
});

// PUT (update) a staff member
app.put("/staff/:id", (req, res) => {
  const staff = readStaff();
  const { id } = req.params;
  const { name, role } = req.body;
  const index = staff.findIndex((s) => s.id === id);

  if (index !== -1) {
    staff[index] = {
      ...staff[index],
      name: name,
      role: role,
      updatedAt: new Date().toISOString(),
    };
    writeStaff(staff);
    res.json(staff[index]);
  } else {
    res.status(404).send("Staff member not found");
  }
});

// DELETE a staff member
app.delete("/staff/:id", (req, res) => {
  let staff = readStaff();
  const { id } = req.params;
  const initialLength = staff.length;
  staff = staff.filter((s) => s.id !== id);

  if (staff.length < initialLength) {
    writeStaff(staff);
    res.status(204).send();
  } else {
    res.status(404).send("Staff member not found");
  }
});

// Work Session related endpoints

// GET all work sessions
app.get("/work-sessions", (req, res) => {
  const sessions = readWorkSessions();
  res.json(sessions);
});

// POST start a work session
app.post("/work-sessions", (req, res) => {
  const sessions = readWorkSessions();
  const { taskId, worker } = req.body;

  // End any existing session for this worker
  for (const [id, session] of Object.entries(sessions)) {
    if (session.worker === worker) {
      // Save the existing session to history before ending
      const completedSession = {
        ...session,
        endTime: new Date().toISOString(),
        duration: new Date() - new Date(session.startTime),
      };

      // Add to work sessions history
      const history = readWorkSessionsHistory();
      history.push(completedSession);
      writeWorkSessionsHistory(history);

      // Broadcast the existing session end to all connected clients
      broadcast({
        type: "work_session_ended",
        data: { taskId: id, worker: session.worker },
      });
      delete sessions[id];
    }
  }

  // Create new session
  const newSession = {
    taskId: taskId,
    worker: worker,
    startTime: new Date().toISOString(),
    isWorking: true,
  };

  sessions[taskId] = newSession;
  writeWorkSessions(sessions);

  // Broadcast the work session start to all connected clients
  broadcast({
    type: "work_session_started",
    data: newSession,
  });

  res.status(201).json(newSession);
});

// POST end a work session
app.post("/work-sessions/end", (req, res) => {
  const sessions = readWorkSessions();
  const { taskId, pagesWorked } = req.body;

  if (sessions[taskId]) {
    const session = sessions[taskId];

    const completedSession = {
      ...session,
      endTime: new Date().toISOString(),
      duration: new Date() - new Date(session.startTime),
      pagesWorked: pagesWorked, // Add pagesWorked
    };

    const history = readWorkSessionsHistory();
    history.push(completedSession);
    writeWorkSessionsHistory(history);

    delete sessions[taskId];
    writeWorkSessions(sessions);

    broadcast({
      type: "work_session_ended",
      data: { taskId, worker: session.worker },
    });

    res.status(200).json(completedSession);
  } else {
    res.status(404).send("Work session not found");
  }
});

// Attendance Data related endpoints

// GET attendance data (work sessions history)
app.get("/attendance-data", (req, res) => {
  const history = readWorkSessionsHistory();
  res.json(history);
});

// POST attendance data (save work sessions history)
app.post("/attendance-data", (req, res) => {
  const historyData = req.body;
  writeWorkSessionsHistory(historyData);
  res.status(200).json({ message: "Attendance data saved successfully" });
});

// Data Management API endpoints

// Staff data management
app.get("/api/staff/backup", (req, res) => {
  const staff = readStaff();
  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=staff_backup_${new Date().toISOString().split("T")[0]}.json`
  );
  res.json(staff);
});

app.post("/api/staff/restore", (req, res) => {
  try {
    const staffData = req.body;
    if (!Array.isArray(staffData)) {
      return res.status(400).json({ error: "Invalid staff data format" });
    }
    writeStaff(staffData);
    res.status(200).json({ message: "Staff data restored successfully", count: staffData.length });
  } catch (error) {
    console.error("Error restoring staff data:", error);
    res.status(500).json({ error: "Failed to restore staff data" });
  }
});

app.delete("/api/staff/clear", (req, res) => {
  try {
    const { password } = req.body;
    if (password !== "재활용") {
      return res.status(403).json({ error: "Invalid password" });
    }
    writeStaff([]);
    res.status(200).json({ message: "Staff data cleared successfully" });
  } catch (error) {
    console.error("Error clearing staff data:", error);
    res.status(500).json({ error: "Failed to clear staff data" });
  }
});

app.get("/api/staff/info", (req, res) => {
  try {
    const staff = readStaff();
    const stats = fs.statSync(STAFF_FILE);
    res.json({
      count: staff.length,
      lastModified: stats.mtime,
      size: stats.size
    });
  } catch (error) {
    res.json({
      count: 0,
      lastModified: null,
      size: 0
    });
  }
});

// Work sessions history data management
app.get("/api/work-sessions-history/backup", (req, res) => {
  const history = readWorkSessionsHistory();
  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=work_sessions_history_backup_${new Date().toISOString().split("T")[0]}.json`
  );
  res.json(history);
});

app.post("/api/work-sessions-history/restore", (req, res) => {
  try {
    const historyData = req.body;
    if (!Array.isArray(historyData)) {
      return res.status(400).json({ error: "Invalid work sessions history data format" });
    }
    writeWorkSessionsHistory(historyData);
    res.status(200).json({ message: "Work sessions history restored successfully", count: historyData.length });
  } catch (error) {
    console.error("Error restoring work sessions history:", error);
    res.status(500).json({ error: "Failed to restore work sessions history" });
  }
});

app.delete("/api/work-sessions-history/clear", (req, res) => {
  try {
    const { password } = req.body;
    if (password !== "재활용") {
      return res.status(403).json({ error: "Invalid password" });
    }
    writeWorkSessionsHistory([]);
    res.status(200).json({ message: "Work sessions history cleared successfully" });
  } catch (error) {
    console.error("Error clearing work sessions history:", error);
    res.status(500).json({ error: "Failed to clear work sessions history" });
  }
});

app.get("/api/work-sessions-history/info", (req, res) => {
  try {
    const history = readWorkSessionsHistory();
    const stats = fs.statSync(WORK_SESSIONS_HISTORY_FILE);
    res.json({
      count: history.length,
      lastModified: stats.mtime,
      size: stats.size
    });
  } catch (error) {
    res.json({
      count: 0,
      lastModified: null,
      size: 0
    });
  }
});

// Books data management (existing functionality enhanced)
app.get("/api/books/backup", (req, res) => {
  const books = readBooks();
  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=books_backup_${new Date().toISOString().split("T")[0]}.json`
  );
  res.json(books);
});

app.post("/api/books/restore", (req, res) => {
  try {
    const booksData = req.body;
    if (!Array.isArray(booksData)) {
      return res.status(400).json({ error: "Invalid books data format" });
    }
    writeBooks(booksData);
    res.status(200).json({ message: "Books data restored successfully", count: booksData.length });
  } catch (error) {
    console.error("Error restoring books data:", error);
    res.status(500).json({ error: "Failed to restore books data" });
  }
});

app.delete("/api/books/clear", (req, res) => {
  try {
    const { password } = req.body;
    if (password !== "재활용") {
      return res.status(403).json({ error: "Invalid password" });
    }
    writeBooks([]);
    res.status(200).json({ message: "Books data cleared successfully" });
  } catch (error) {
    console.error("Error clearing books data:", error);
    res.status(500).json({ error: "Failed to clear books data" });
  }
});

app.get("/api/books/info", (req, res) => {
  try {
    const books = readBooks();
    const stats = fs.statSync(DATA_FILE);
    res.json({
      count: books.length,
      lastModified: stats.mtime,
      size: stats.size
    });
  } catch (error) {
    res.json({
      count: 0,
      lastModified: null,
      size: 0
    });
  }
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("New WebSocket connection established");

  ws.on("message", (message) => {
    console.log("Received:", message.toString());
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Broadcast function to all connected clients
const broadcast = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server running on port ${PORT}. Open http://<your-internal-ip>:${PORT} in your browser.`
  );
  console.log(`WebSocket server is also running on the same port`);
});
