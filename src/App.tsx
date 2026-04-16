import { useState, useRef } from 'react'
import type { DragEvent } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setError(null)
      setResultUrl(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
      setResultUrl(null)
    }
  }

  const uploadFile = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post('https://file.io', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      if (response.data.success) {
        setResultUrl(response.data.link)
      } else {
        throw new Error(response.data.message || 'Upload failed')
      }
    } catch (err) {
      setError('Upload failed. file.io may have a file size limit (usually 2GB).')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const copyToClipboard = () => {
    if (resultUrl) {
      navigator.clipboard.writeText(resultUrl)
      alert('URL copied to clipboard!')
    }
  }

  return (
    <div className="container">
      <h1>File Share</h1>
      <p className="subtitle">Simple, anonymous file hosting (powered by file.io)</p>

      <div 
        className={`upload-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          onChange={handleFileChange} 
          style={{ display: 'none' }}
        />
        {file ? (
          <div className="file-info">
            <span className="file-name">{file.name}</span>
            <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
          </div>
        ) : (
          <div className="upload-prompt">
            <span className="icon">📁</span>
            <span>Drag & Drop or Click to Select</span>
          </div>
        )}
      </div>

      <div className="actions">
        <button 
          onClick={uploadFile} 
          disabled={!file || uploading}
          className="upload-button"
        >
          {uploading ? 'Uploading...' : 'Upload to file.io'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {resultUrl && (
        <div className="result">
          <p>Success! Your file is available at:</p>
          <div className="url-container">
            <input type="text" readOnly value={resultUrl} />
            <button onClick={copyToClipboard}>Copy</button>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>Files are hosted on <a href="https://file.io" target="_blank" rel="noreferrer">file.io</a></p>
        <p className="note">Note: file.io deletes files after the first download.</p>
      </footer>
    </div>
  )
}

export default App
