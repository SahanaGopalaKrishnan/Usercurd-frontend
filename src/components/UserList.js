import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUsers, deleteUser } from '../redux/userSlice';

function UserList() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.users);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      dispatch(deleteUser(id));
    }
  };

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    return `http://localhost:8081/${photoPath}`;
  };

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div style={styles.loading}>Loading users...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>All Users</h1>
      
      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <Link to="/add-user" style={styles.addButton}>
          + Add New User
        </Link>
      </div>
      
      <div style={styles.userGrid}>
        {filteredUsers.map((user) => (
          <div key={user.id} style={styles.card}>
            <div style={styles.photoContainer}>
              {getPhotoUrl(user.photoPath) ? (
                <img 
                  src={getPhotoUrl(user.photoPath)} 
                  alt={user.fullName}
                  style={styles.photo}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div style={styles.placeholderPhoto}>
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>
              )}
            </div>
            <div style={styles.cardContent}>
              <h3 style={styles.cardName}>{user.fullName}</h3>
              <p style={styles.cardAge}>Age: {user.age} years</p>
              <p style={styles.cardEmail}>{user.email}</p>
              <p style={styles.cardPhone}>📞 {user.phoneNumber || 'Not provided'}</p>
            </div>
            <div style={styles.cardActions}>
              <Link to={`/users/${user.id}`} style={styles.viewButton}>
                View Details
              </Link>
              <Link to={`/edit-user/${user.id}`} style={styles.editButton}>
                Edit
              </Link>
              <button 
                onClick={() => handleDelete(user.id, user.fullName)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredUsers.length === 0 && (
        <div style={styles.noUsers}>
          <p>No users found.</p>
          {searchTerm && <p>Try a different search term.</p>}
          {!searchTerm && <Link to="/add-user" style={styles.addButtonInline}>Add Your First User</Link>}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
  },
  searchBar: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '30px',
    gap: '20px',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '5px',
  },
  addButton: {
    padding: '12px 24px',
    backgroundColor: '#28a745',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
  },
  userGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: 'white',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  photoContainer: {
    height: '200px',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  placeholderPhoto: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#3498db',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '36px',
    fontWeight: 'bold',
  },
  cardContent: {
    padding: '15px',
  },
  cardName: {
    margin: '0 0 5px 0',
    color: '#333',
    fontSize: '18px',
  },
  cardAge: {
    margin: '0 0 5px 0',
    color: '#666',
    fontSize: '14px',
  },
  cardEmail: {
    margin: '0 0 5px 0',
    color: '#999',
    fontSize: '14px',
  },
  cardPhone: {
    margin: '0',
    color: '#999',
    fontSize: '13px',
  },
  cardActions: {
    padding: '15px',
    borderTop: '1px solid #eee',
    display: 'flex',
    gap: '10px',
  },
  viewButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#007bff',
    color: 'white',
    textAlign: 'center',
    textDecoration: 'none',
    borderRadius: '5px',
  },
  editButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#ffc107',
    color: '#333',
    textAlign: 'center',
    textDecoration: 'none',
    borderRadius: '5px',
  },
  deleteButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#666',
  },
  noUsers: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    color: '#666',
  },
  addButtonInline: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    marginTop: '10px',
  },
};

export default UserList;