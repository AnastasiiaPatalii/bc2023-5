const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const PORT = 8000;
const dataFilePath = path.join(__dirname, 'notes.json');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/notes', (req, res) => {
  const notes = loadNotes();
  res.json(notes);
});

app.get('/UploadForm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'UploadForm.html'));
});

app.post('/upload', upload.fields([{ name: 'note_name' }, { name: 'note' }]), (req, res) => {
    const noteName = req.body.note_name;
    const noteText = req.body.note;
  
    try {
      const notes = loadNotes();
  
      const existingNoteIndex = notes.findIndex(note => note.name === noteName);
  
      if (existingNoteIndex !== -1) {
        res.status(400).send('Bad Request: Note with the same name already exists.');
      } else {
        notes.push({ name: noteName, text: noteText });
        saveNotes(notes);
        res.status(201).send('Note uploaded successfully.');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

app.get('/notes/:note_name', (req, res) => {
  const noteName = req.params.note_name;
  const notes = loadNotes();

  const note = notes.find(note => note.name === noteName);

  if (!note) {
    return res.status(404).send('Note not found');
  }

  res.json({ name: note.name, text: note.text });
});

app.put('/notes/:note_name', (req, res) => {
  const noteName = req.params.note_name;
  const newNoteText = req.body.note;

  const notes = loadNotes();

  const index = notes.findIndex(note => note.name === noteName);

  if (index === -1) {
    return res.status(404).send('Note not found');
  }

  notes[index].text = newNoteText;
  saveNotes(notes);

  res.send('Note updated successfully');
});

app.delete('/notes/:note_name', (req, res) => {
  const noteName = req.params.note_name;

  const notes = loadNotes();

  const index = notes.findIndex(note => note.name === noteName);

  if (index === -1) {
    return res.status(404).send('Note not found');
  }

  notes.splice(index, 1);
  saveNotes(notes);

  res.send('Note deleted successfully');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function loadNotes() {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data) || [];
  } catch (error) {
    return [];
  }
}

function saveNotes(notes) {
  fs.writeFileSync(dataFilePath, JSON.stringify(notes, null, 2), 'utf8');
}
