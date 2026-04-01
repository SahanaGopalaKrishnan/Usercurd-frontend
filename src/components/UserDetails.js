import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserById, deleteUser } from '../redux/userSlice';

function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, loading } = useSelector((state) => state.users);
  const [certificates, setCertificates] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [certificateType, setCertificateType] = useState('SCHOOL');
  const [uploading, setUploading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    dispatch(fetchUserById(id));
    loadCertificates();
  }, [dispatch, id]);

  const loadCertificates = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/users/${id}/certificates`);
      if (response.ok) {
        const data = await response.json();
        setCertificates(data);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 3000);
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const getPhotoUrl = () => {
    if (!currentUser?.photoPath) return null;
    return `http://localhost:8081/${currentUser.photoPath}`;
  };

  // Photo Upload - Fixed
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      showError('Please select a file');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);  // IMPORTANT: field name must be 'photo'

    try {
      const response = await fetch(`http://localhost:8081/api/users/${id}/photo`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.text();
      
      if (response.ok) {
        showSuccess('Photo uploaded successfully!');
        dispatch(fetchUserById(id));
        e.target.value = ''; // Reset file input
      } else {
        showError(result || 'Upload failed');
        console.error('Upload error:', result);
      }
    } catch (error) {
      showError('Network error: ' + error.message);
      console.error('Error:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Certificate Upload - Fixed
  const handleCertificateUpload = async () => {
    if (!selectedFile) {
      showError('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);  // IMPORTANT: field name must be 'file'
    formData.append('certificateType', certificateType);  // IMPORTANT: certificateType required

    try {
      const response = await fetch(`http://localhost:8081/api/users/${id}/certificates`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        showSuccess(`${certificateType} certificate uploaded successfully!`);
        setSelectedFile(null);
        const fileInput = document.getElementById('certificateFile');
        if (fileInput) fileInput.value = '';
        loadCertificates();
      } else {
        const error = await response.text();
        showError(error || 'Upload failed');
      }
    } catch (error) {
      showError('Network error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCertificate = async (certId) => {
    if (window.confirm('Delete this certificate?')) {
      try {
        const response = await fetch(`http://localhost:8081/api/users/certificates/${certId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          showSuccess('Certificate deleted!');
          loadCertificates();
        } else {
          showError('Delete failed');
        }
      } catch (error) {
        showError('Network error');
      }
    }
  };

  const handleDeleteUser = () => {
    if (window.confirm(`Are you sure you want to delete ${currentUser?.fullName}?`)) {
      dispatch(deleteUser(id));
      navigate('/users');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  if (loading || !currentUser) {
    return <div style={styles.loading}>Loading user details...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/users" style={styles.backButton}>← Back to Users</Link>
        <div style={styles.actionButtons}>
          <Link to={`/edit-user/${id}`} style={styles.editButton}>✏️ Edit User</Link>
          <button onClick={handleDeleteUser} style={styles.deleteButton}>🗑️ Delete User</button>
        </div>
      </div>

      {errorMsg && <div style={styles.errorMessage}>{errorMsg}</div>}
      {successMsg && <div style={styles.successMessage}>{successMsg}</div>}

      <div style={styles.userCard}>
        <div style={styles.photoSection}>
          {getPhotoUrl() ? (
            <img 
              src={getPhotoUrl()} 
              alt={currentUser.fullName}
              style={styles.profilePhoto}
              onError={(e) => {
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                if (parent) {
                  const placeholder = document.createElement('div');
                  placeholder.style.cssText = styles.placeholderPhoto;
                  placeholder.textContent = `${currentUser.firstName?.charAt(0)}${currentUser.lastName?.charAt(0)}`;
                  parent.appendChild(placeholder);
                }
              }}
            />
          ) : (
            <div style={styles.placeholderPhoto}>
              {currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}
            </div>
          )}
          <div style={styles.uploadPhoto}>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={styles.fileInput}
              id="photoUpload"
              disabled={uploadingPhoto}
            />
            <label htmlFor="photoUpload" style={styles.uploadPhotoButton}>
              {uploadingPhoto ? '⏳ Uploading...' : '📷 Upload Photo'}
            </label>
          </div>
        </div>
        
        <div style={styles.infoSection}>
          <h1 style={styles.userName}>{currentUser.fullName}</h1>
          <div style={styles.infoRow}>
            <strong>Email:</strong> {currentUser.email}
          </div>
          <div style={styles.infoRow}>
            <strong>Date of Birth:</strong> {currentUser.dateOfBirth}
          </div>
          <div style={styles.infoRow}>
            <strong>Age:</strong> {currentUser.age} years
          </div>
          <div style={styles.infoRow}>
            <strong>Phone:</strong> {currentUser.phoneNumber || 'Not provided'}
          </div>
        </div>
      </div>

      <div style={styles.certificateSection}>
        <h2 style={styles.sectionTitle}>📄 Certificates</h2>
        
        <div style={styles.uploadSection}>
          <select 
            value={certificateType}
            onChange={(e) => setCertificateType(e.target.value)}
            style={styles.select}
          >
            <option value="SCHOOL">🏫 School Certificate</option>
            <option value="COLLEGE">🎓 College Certificate</option>
          </select>
          
          <input
            type="file"
            id="certificateFile"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            style={styles.fileInputSmall}
            accept=".pdf,.jpg,.jpeg,.png"
          />
          
          <button 
            onClick={handleCertificateUpload}
            disabled={uploading}
            style={styles.uploadButton}
          >
            {uploading ? '⏳ Uploading...' : 'Upload Certificate'}
          </button>
        </div>
        
        <div style={styles.certificateList}>
          {certificates.length === 0 ? (
            <p style={styles.noCertificates}>No certificates uploaded yet.</p>
          ) : (
            certificates.map((cert) => (
              <div key={cert.id} style={styles.certificateCard}>
                <div>
                  <span style={cert.certificateType === 'SCHOOL' ? styles.schoolBadge : styles.collegeBadge}>
                    {cert.certificateType}
                  </span>
                  <p><strong>File:</strong> {cert.fileName}</p>
                  <p><strong>Size:</strong> {formatFileSize(cert.fileSize)}</p>
                  <p><strong>Uploaded:</strong> {new Date(cert.uploadedAt).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => handleDeleteCertificate(cert.id)}
                  style={styles.deleteCertButton}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    display: 'inline-block',
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    padding: '10px 20px',
    backgroundColor: '#ffc107',
    color: '#333',
    textDecoration: 'none',
    borderRadius: '5px',
  },
  deleteButton: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
    border: '1px solid #c3e6cb',
  },
  userCard: {
    display: 'flex',
    gap: '30px',
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  photoSection: {
    textAlign: 'center',
    minWidth: '200px',
  },
  profilePhoto: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '15px',
    border: '3px solid #007bff',
  },
  placeholderPhoto: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '72px',
    fontWeight: 'bold',
    marginBottom: '15px',
    margin: '0 auto 15px auto',
  },
  uploadPhoto: {
    marginTop: '10px',
  },
  fileInput: {
    display: 'none',
  },
  uploadPhotoButton: {
    display: 'inline-block',
    padding: '8px 15px',
    backgroundColor: '#28a745',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  infoSection: {
    flex: 1,
  },
  userName: {
    marginTop: 0,
    color: '#333',
    marginBottom: '20px',
  },
  infoRow: {
    marginBottom: '10px',
    padding: '8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
  },
  certificateSection: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#333',
  },
  uploadSection: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  select: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  fileInputSmall: {
    flex: 1,
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '5px',
  },
  uploadButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  certificateList: {
    marginTop: '20px',
  },
  certificateCard: {
    border: '1px solid #e0e0e0',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  schoolBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    backgroundColor: '#28a745',
    color: 'white',
    borderRadius: '3px',
    fontSize: '12px',
    marginBottom: '10px',
  },
  collegeBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '3px',
    fontSize: '12px',
    marginBottom: '10px',
  },
  deleteCertButton: {
    padding: '5px 15px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  noCertificates: {
    textAlign: 'center',
    color: '#999',
    padding: '20px',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#666',
  },
};

export default UserDetails;