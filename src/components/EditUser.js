import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserById, updateUser, updatePartialUser, deleteUser } from '../redux/userSlice';

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, loading } = useSelector((state) => state.users);
  const [updateType, setUpdateType] = useState('full'); // 'full' or 'partial'

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    phoneNumber: '',
    photo: null,
  });

  const [partialData, setPartialData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    phoneNumber: '',
    photo: null,
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    dispatch(fetchUserById(id));
  }, [dispatch, id]);

 useEffect(() => {
  if (currentUser) {
    setFormData({
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      email: currentUser.email || '',
      dateOfBirth: currentUser.dateOfBirth || '',
      phoneNumber: currentUser.phoneNumber || '',
      photo: null,
    });

    {currentUser.photoPath && (
  <img
    src={`http://localhost:8081/api/users/photo/${id}`}
    alt={currentUser.fullName}
    style={styles.profilePhoto}
  />
)} 
  }
}, [currentUser]);
  const handleFullUpdateChange = (e) => {
    if (e.target.name === 'photo') {
      setFormData({ ...formData, photo: e.target.files[0] });
      setPreview(URL.createObjectURL(e.target.files[0]));
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handlePartialUpdateChange = (e) => {
    if (e.target.name === 'photo') {
      setPartialData({ ...partialData, photo: e.target.files[0] });
      setPreview(URL.createObjectURL(e.target.files[0]));
    } else {
      setPartialData({ ...partialData, [e.target.name]: e.target.value });
    }
  };

  const handleFullUpdate = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) data.append(key, value);
      });

      await dispatch(updateUser({ id, userData: data }));
      alert('User updated successfully!');
      navigate(`/users/${id}`);
    } catch (error) {
      alert('Error updating user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePartialUpdate = async (e) => {
    e.preventDefault();

    const updateData = new FormData();
    Object.entries(partialData).forEach(([key, value]) => {
      if (value) updateData.append(key, value);
    });

    if (updateData.entries().next().done) {
      alert('Please fill at least one field to update');
      return;
    }

    try {
      await dispatch(updatePartialUser({ id, userData: updateData }));
      alert('User partially updated successfully!');
      dispatch(fetchUserById(id));
      setPartialData({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        phoneNumber: '',
        photo: null,
      });
      setPreview(currentUser.photo || null);
    } catch (error) {
      alert('Error updating user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUser = () => {
    if (window.confirm(`Are you sure you want to delete ${currentUser?.fullName}? This action cannot be undone.`)) {
      dispatch(deleteUser(id));
      navigate('/users');
    }
  };

  if (loading || !currentUser) {
    return <div style={styles.loading}>Loading user data...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to={`/users/${id}`} style={styles.backButton}>← Back to User Details</Link>
        <button onClick={handleDeleteUser} style={styles.deleteButton}>🗑️ Delete User</button>
      </div>

      <div style={styles.card}>
        <h1 style={styles.title}>Edit User: {currentUser.fullName}</h1>
        
        {preview && <img src={preview} alt="Profile Preview" style={styles.previewImage} />}

        <div style={styles.toggleButtons}>
          <button 
            onClick={() => setUpdateType('full')}
            style={updateType === 'full' ? styles.activeButton : styles.inactiveButton}
          >
            Full Update (PUT)
          </button>
          <button 
            onClick={() => setUpdateType('partial')}
            style={updateType === 'partial' ? styles.activeButton : styles.inactiveButton}
          >
            Partial Update (PATCH)
          </button>
        </div>

        {updateType === 'full' ? (
          <form onSubmit={handleFullUpdate}>
            <h3 style={styles.subtitle}>Full Update - All fields required</h3>
            
            {['firstName', 'lastName', 'email', 'dateOfBirth', 'phoneNumber'].map((field) => (
              <div style={styles.formGroup} key={field}>
                <label style={styles.label}>
                  {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} *
                </label>
                <input
                  type={field === 'email' ? 'email' : field === 'dateOfBirth' ? 'date' : field === 'phoneNumber' ? 'tel' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleFullUpdateChange}
                  required={field !== 'phoneNumber'}
                  style={styles.input}
                />
              </div>
            ))}

            <div style={styles.formGroup}>
              <label style={styles.label}>Profile Photo</label>
              <input type="file" name="photo" accept="image/*" onChange={handleFullUpdateChange} style={styles.input} />
            </div>

            <button type="submit" style={styles.submitButton}>
              Update Full User (PUT)
            </button>
          </form>
        ) : (
          <form onSubmit={handlePartialUpdate}>
            <h3 style={styles.subtitle}>Partial Update - Update only specific fields</h3>
            <p style={styles.note}>Only fill fields you want to update. Empty fields will remain unchanged.</p>
            
            {['firstName', 'lastName', 'email', 'dateOfBirth', 'phoneNumber'].map((field) => (
              <div style={styles.formGroup} key={field}>
                <label style={styles.label}>{field.replace(/([A-Z])/, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                <input
                  type={field === 'email' ? 'email' : field === 'dateOfBirth' ? 'date' : field === 'phoneNumber' ? 'tel' : 'text'}
                  name={field}
                  value={partialData[field]}
                  onChange={handlePartialUpdateChange}
                  placeholder={`Current: ${currentUser[field] || 'Not set'}`}
                  style={styles.input}
                />
              </div>
            ))}

            <div style={styles.formGroup}>
              <label style={styles.label}>Profile Photo</label>
              <input type="file" name="photo" accept="image/*" onChange={handlePartialUpdateChange} style={styles.input} />
            </div>

            <button type="submit" style={styles.patchButton}>
              Update Selected Fields (PATCH)
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  ...{
    container: { maxWidth: '600px', margin: '0 auto', padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
    backButton: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '5px' },
    deleteButton: { padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    card: { backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    title: { textAlign: 'center', color: '#333', marginBottom: '20px' },
    subtitle: { color: '#555', marginBottom: '10px' },
    note: { fontSize: '12px', color: '#999', marginBottom: '20px' },
    toggleButtons: { display: 'flex', gap: '10px', marginBottom: '30px' },
    activeButton: { flex: 1, padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    inactiveButton: { flex: 1, padding: '10px', backgroundColor: '#e9ecef', color: '#666', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' },
    input: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px', boxSizing: 'border-box' },
    submitButton: { width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
    patchButton: { width: '100%', padding: '12px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' },
    previewImage: { display: 'block', margin: '0 auto 20px', width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' },
  }
};

export default EditUser;