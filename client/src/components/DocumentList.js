import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DocumentList.css';
import * as filestack from 'filestack-js';

const DocumentList = () => {
    const [documents, setDocuments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [notes, setNotes] = useState('');
    const [physicalLocation, setPhysicalLocation] = useState('');

    const filestackClient = filestack.init('YOUR_FILESTACK_API_KEY'); // Replace with your key

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = () => {
        axios.get('http://localhost:5000/documents')
            .then(response => {
                setDocuments(response.data);
            })
            .catch(error => {
                console.error('Error fetching documents:', error);
            });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        axios.get(`http://localhost:5000/documents/search?term=${searchTerm}`)
            .then(response => {
                setDocuments(response.data);
            })
            .catch(error => {
                console.error('Error searching documents:', error);
            });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        axios.post('http://localhost:5000/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(res => {
            fetchDocuments();
            alert('File uploaded and processed successfully!');
        })
        .catch(err => {
            console.error('Error uploading file:', err);
            alert('Error uploading file.');
        });
    };
    
    const handlePreview = (doc) => {
        setSelectedDoc(doc);
        setNotes(doc.notes || '');
        setPhysicalLocation(doc.physicalLocation || '');
        // For many file types, the filepath from Filestack is directly viewable.
        // For others, you might need a more specific viewer or conversion.
        setPreviewUrl(doc.filepath);
    };

    const handleUpdateDoc = () => {
        if (!selectedDoc) return;
        axios.put(`http://localhost:5000/documents/${selectedDoc._id}`, { notes, physicalLocation })
            .then(res => {
                alert('Document updated!');
                fetchDocuments();
                const updatedDoc = { ...selectedDoc, notes, physicalLocation };
                setSelectedDoc(updatedDoc);
            })
            .catch(err => console.error('Error updating document:', err));
    };


    return (
        <div className="container">
            <div className="upload-section card">
                <h2>Upload Document</h2>
                <input type="file" onChange={handleFileChange} />
                <button onClick={handleUpload}>Upload and Process with OCR</button>
            </div>

            <div className="search-section card">
                <h2>Search Documents</h2>
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search in document content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit">Search</button>
                </form>
            </div>

            <div className="main-content">
                <div className="document-list card">
                    <h2>Document List</h2>
                    <ul>
                        {documents.map(doc => (
                            <li key={doc._id} onClick={() => handlePreview(doc)}>
                                {doc.filename}
                            </li>
                        ))}
                    </ul>
                </div>

                {selectedDoc && (
                    <div className="preview-section card">
                        <h2>Document Preview & Details</h2>
                        <div className="preview-container">
                            {previewUrl && <iframe src={previewUrl} title="Document Preview" />}
                        </div>
                        <div className="details-container">
                            <h3>Notes</h3>
                            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
                            <h3>Physical Location</h3>
                            <input type="text" value={physicalLocation} onChange={(e) => setPhysicalLocation(e.target.value)} />
                            <button onClick={handleUpdateDoc}>Save Details</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentList;
