import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUsers } from '../redux/userSlice';

function Home() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) {
    return <div style={styles.loading}>Loading users...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>User Management System</h1>
        <p style={styles.subtitle}>Click on any user to view details</p>
      </div>
      
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <h3>Total Users</h3>
          <p style={styles.statNumber}>{users.length}</p>
        </div>
      </div>
      
      <h2 style={styles.sectionTitle}>All Users Names</h2>
      <div style={styles.userList}>
        {users.map((user) => (
          <Link to={`/users/${user.id}`} key={user.id} style={styles.userCardLink}>
            <div style={styles.userCard}>
              <div style={styles.userAvatar}>
                {user.photoPath ? (
                  <img 
                    src={`http://localhost:8081/${user.photoPath}`} 
                    alt={user.fullName}
                    style={styles.avatar}
                  />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                )}
              </div>
              <div style={styles.userInfo}>
                <h3 style={styles.userName}>{user.fullName}</h3>
                <p style={styles.userEmail}>{user.email}</p>
                <p style={styles.userAge}>Age: {user.age} years</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {users.length === 0 && (
        <div style={styles.noUsers}>
          <p>No users found. Add your first user!</p>
          <Link to="/add-user" style={styles.addButton}>Add User</Link>
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
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '32px',
    color: '#333',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: '20px 40px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#3498db',
    margin: '10px 0 0',
  },
  sectionTitle: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '20px',
  },
  userList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '15px',
  },
  userCardLink: {
    textDecoration: 'none',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  userAvatar: {
    marginRight: '15px',
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#3498db',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    margin: '0 0 5px 0',
    color: '#333',
    fontSize: '18px',
  },
  userEmail: {
    margin: '0 0 5px 0',
    color: '#666',
    fontSize: '14px',
  },
  userAge: {
    margin: '0',
    color: '#999',
    fontSize: '12px',
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
  },
  addButton: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    marginTop: '10px',
  },
};

export default Home;