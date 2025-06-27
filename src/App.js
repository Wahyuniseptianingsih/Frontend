// File: src/App.js
// Semua komponen digabung dalam satu file untuk kemudahan.

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

// =======================================================
// KOMPONEN HALAMAN ADMIN
// =======================================================
function AdminPage({ user, token }) {
    // General state
    const [movies, setMovies] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    
    // State for toggling forms
    const [showMovieForm, setShowMovieForm] = useState(false);
    const [showScheduleForm, setShowScheduleForm] = useState(false);

    // State for movie form (add/edit)
    const [isEditingMovie, setIsEditingMovie] = useState(false);
    const [currentMovie, setCurrentMovie] = useState({ id: null, title: '', duration: '', synopsis: '', poster_url: '' });

    // State for schedule form
    const [scheduleMovieId, setScheduleMovieId] = useState('');
    const [scheduleShowTime, setScheduleShowTime] = useState('');
    const [schedulePrice, setSchedulePrice] = useState('');

    // Fetch initial data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [moviesRes, schedulesRes] = await Promise.all([
                axios.get('http://localhost:3001/api/movies'),
                axios.get('http://localhost:3001/api/schedules')
            ]);
            setMovies(moviesRes.data);
            setSchedules(schedulesRes.data);
        } catch (err) {
            setError('Gagal mengambil data dari server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleMovieFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        
        const payload = {
            title: currentMovie.title,
            duration: currentMovie.duration,
            synopsis: currentMovie.synopsis,
            poster_url: currentMovie.poster_url,
        };
        const config = { headers: { 'Authorization': `Bearer ${token}` } };

        try {
            if (isEditingMovie) {
                // Proses edit film
                await axios.put(`http://localhost:3001/api/movies/${currentMovie.id}`, payload, config);
                setMessage('Film berhasil diperbarui!');
            } else {
                // Proses tambah film baru
                await axios.post('http://localhost:3001/api/movies', payload, config);
                setMessage('Film baru berhasil ditambahkan!');
            }
            resetAndCloseMovieForm();
            fetchData(); // Refresh data
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan pada server.');
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        const payload = {
            movie_id: parseInt(scheduleMovieId),
            show_time: new Date(scheduleShowTime).toISOString(),
            price: parseInt(schedulePrice)
        };
        try {
            await axios.post('http://localhost:3001/api/schedules', payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage('Jadwal baru berhasil ditambahkan!');
            resetAndCloseScheduleForm();
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menambahkan jadwal.');
        } finally {
            setLoading(false);
        }
    };

    const openEditMovieForm = (movie) => {
        setIsEditingMovie(true);
        setCurrentMovie(movie);
        setShowMovieForm(true);
        setShowScheduleForm(false);
    };

    const openAddMovieForm = () => {
        setIsEditingMovie(false);
        setCurrentMovie({ id: null, title: '', duration: '', synopsis: '', poster_url: '' });
        setShowMovieForm(true);
        setShowScheduleForm(false);
    };
    
    const resetAndCloseMovieForm = () => {
        setShowMovieForm(false);
        setIsEditingMovie(false);
        setCurrentMovie({ id: null, title: '', duration: '', synopsis: '', poster_url: '' });
    };

    const resetAndCloseScheduleForm = () => {
        setShowScheduleForm(false);
        setScheduleMovieId('');
        setScheduleShowTime('');
        setSchedulePrice('');
    };

    return (
        <div className="admin-page">
            <div className="admin-container">
                <h1>Panel Admin</h1>
                <p>Selamat datang, {user.email}.</p>
                <div className="admin-actions">
                    <button onClick={openAddMovieForm}>+ Tambah Film</button>
                    <button onClick={() => {setShowScheduleForm(true); setShowMovieForm(false);}}>+ Tambah Jadwal</button>
                </div>

                {message && <p className="message success-message">{message}</p>}
                {error && <p className="message error-message">{error}</p>}

                {/* Movie Form (Add/Edit) */}
                {showMovieForm && (
                    <div className="form-modal">
                        <form onSubmit={handleMovieFormSubmit} className="admin-form">
                            <div className="form-header">
                                <h2>{isEditingMovie ? 'Edit Film' : 'Tambah Film Baru'}</h2>
                                <button type="button" className="close-button" onClick={resetAndCloseMovieForm}>×</button>
                            </div>
                            <div className="input-group"><label>Judul Film</label><input type="text" value={currentMovie.title} onChange={(e) => setCurrentMovie({...currentMovie, title: e.target.value})} required /></div>
                            <div className="input-group"><label>Durasi (menit)</label><input type="number" value={currentMovie.duration} onChange={(e) => setCurrentMovie({...currentMovie, duration: e.target.value})} required /></div>
                            <div className="input-group"><label>URL Poster</label><input type="text" value={currentMovie.poster_url} onChange={(e) => setCurrentMovie({...currentMovie, poster_url: e.target.value})} /></div>
                            <div className="input-group"><label>Sinopsis</label><textarea value={currentMovie.synopsis} onChange={(e) => setCurrentMovie({...currentMovie, synopsis: e.target.value})}></textarea></div>
                            <button type="submit" className="auth-button submit-button" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Film'}</button>
                        </form>
                    </div>
                )}

                {/* Schedule Form */}
                {showScheduleForm && (
                     <div className="form-modal">
                        <form onSubmit={handleScheduleFormSubmit} className="admin-form">
                             <div className="form-header">
                                <h2>Tambah Jadwal Baru</h2>
                                <button type="button" className="close-button" onClick={resetAndCloseScheduleForm}>×</button>
                            </div>
                            <div className="input-group"><label>Pilih Film</label><select value={scheduleMovieId} onChange={(e) => setScheduleMovieId(e.target.value)} required><option value="" disabled>-- Pilih Film --</option>{movies.map(movie => (<option key={movie.id} value={movie.id}>{movie.title}</option>))}</select></div>
                            <div className="input-group"><label>Waktu Tayang</label><input type="datetime-local" value={scheduleShowTime} onChange={(e) => setScheduleShowTime(e.target.value)} required /></div>
                            <div className="input-group"><label>Harga Tiket</label><input type="number" placeholder="50000" value={schedulePrice} onChange={(e) => setSchedulePrice(e.target.value)} required /></div>
                            <button type="submit" className="auth-button submit-button" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Jadwal'}</button>
                        </form>
                    </div>
                )}


                {/* Movie List */}
                <div className="data-list">
                    <h2>Daftar Film</h2>
                    {loading ? <p>Memuat...</p> : movies.map(movie => (
                        <div key={movie.id} className="data-item">
                            <span>{movie.title} ({movie.duration} menit)</span>
                            <div className="item-actions">
                                <button onClick={() => openEditMovieForm(movie)}>Edit</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


// =======================================================
// KOMPONEN-KOMPONEN LAINNYA
// =======================================================

function Navbar({ user, onLogout }) {
    return (
        <header className="app-header"><Link to="/" className="header-title-link"><h1 className="header-title">Bioskop Keren</h1></Link><div className="header-user-section">{user ? (<>{user.role === 'admin' && (<Link to="/admin" className="my-tickets-button">Halaman Admin</Link>)}<span className="user-name">Halo, {user.email}!</span><button onClick={onLogout} className="logout-button">Logout</button></>) : <Link to="/login" className="login-button">Login</Link>}</div></header>
    );
}

function AuthPage({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        const endpoint = 'http://localhost:3001/api/login';
        const payload = { email, password };
        try {
            const response = await axios.post(endpoint, payload);
            onLoginSuccess(response.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="auth-page"><div className="auth-container"><h2>Login</h2><form onSubmit={handleSubmit}><div className="input-group"><label htmlFor="email">Email</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div><div className="input-group"><label htmlFor="password">Password</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>{error && <p className="error-message">{error}</p>}<button type="submit" className="auth-button" disabled={loading}>{loading ? 'Memproses...' : 'Login'}</button></form><p className="switch-mode">Fitur Register belum tersedia.</p></div></div>
    );
}

function MovieList() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/movies');
                setMovies(response.data);
            } catch (err) {
                setError('Gagal mengambil data. Pastikan server backend berjalan.');
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);
    if (loading) return <div className="app-container"><h1>Memuat film...</h1></div>;
    if (error) return <div className="app-container"><h1>Error: {error}</h1></div>;
    return (
        <main className="movie-grid">{movies.map(movie => (<Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card-link"><div className="movie-card"><div className="movie-poster-placeholder" style={{ backgroundImage: `url(${movie.poster_url || `https://placehold.co/400x600/222/fff?text=${movie.title.replace(' ',`\n`)}`})` }}></div><div className="movie-title-container"><h3 className="movie-title">{movie.title}</h3></div></div></Link>))}
        </main>
    );
}

function MovieDetail({ user }) {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    useEffect(() => {
        const fetchMovieDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/movies/${id}`);
                setMovie(response.data);
            } catch (err) {
                setError('Gagal mengambil detail film.');
            } finally {
                setLoading(false);
            }
        };
        fetchMovieDetail();
    }, [id]);
    if (loading) return <div className="app-container"><h1>Memuat detail...</h1></div>;
    if (error) return <div className="app-container"><h1>Error: {error}</h1></div>;
    if (!movie) return <div className="app-container"><h1>Film tidak ditemukan.</h1></div>;
    return (
        <div className="detail-page-background">
            <div className="movie-detail-container">
                <div className="detail-poster-placeholder" style={{ backgroundImage: `url(${movie.poster_url || `https://placehold.co/400x600/222/fff?text=${movie.title.replace(' ', `\n`)}`})` }}></div>
                <div className="detail-info">
                    <h1>{movie.title}</h1>
                    <div className="detail-meta"><span>Durasi: {movie.duration} menit</span></div>
                    <h2>Sinopsis</h2>
                    <p className="synopsis-text">{movie.synopsis || 'Sinopsis belum tersedia.'}</p>
                    <div className="schedule-section">
                        <h3>Pilih Jadwal Hari Ini:</h3>
                        <div className="schedule-options">{movie.schedules && movie.schedules.length > 0 ? movie.schedules.map(schedule => (<button key={schedule.id} className={`schedule-button ${selectedSchedule?.id === schedule.id ? 'selected' : ''}`} onClick={() => setSelectedSchedule(schedule)}><span className="time">{new Date(schedule.show_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span><span className="studio">Rp {schedule.price.toLocaleString('id-ID')}</span></button>)) : <p>Jadwal belum tersedia.</p>}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// =======================================================
// KOMPONEN UTAMA (APP)
// =======================================================
function App() {
    const [authData, setAuthData] = useState(() => { try { const saved = localStorage.getItem('authData'); return saved ? JSON.parse(saved) : null; } catch (error) { return null; } });
    useEffect(() => { if (authData) { localStorage.setItem('authData', JSON.stringify(authData)); } else { localStorage.removeItem('authData'); } }, [authData]);
    const handleLoginSuccess = (data) => { setAuthData(data); };
    const handleLogout = () => { setAuthData(null); };
    return (
        <><style>{styles}</style><Router><Navbar user={authData?.user} onLogout={handleLogout} /><div className="main-content"><Routes><Route path="/" element={<MovieList />} /><Route path="/movie/:id" element={<MovieDetail user={authData?.user} />} /><Route path="/login" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} /><Route path="/admin" element={authData?.user?.role === 'admin' ? <AdminPage user={authData.user} token={authData.accessToken} /> : <div className="app-container"><h1>Akses Ditolak</h1><p>Anda harus login sebagai admin untuk mengakses halaman ini.</p></div>} /><Route path="*" element={<div className="app-container"><h1>404 - Halaman Tidak Ditemukan</h1></div>} /></Routes></div></Router></>
    );
}

// --- Kumpulan kode CSS ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  body { margin: 0; font-family: 'Inter', sans-serif; background-color: #141414; color: white; }
  .app-container, .detail-page-background, .booking-page, .ticket-page, .payment-page, .my-tickets-page { padding: 2rem; }
  .main-content { padding-top: 80px; }
  .app-header { background-color: #1a1a1a; padding: 15px 40px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
  .header-title-link { text-decoration: none; color: inherit; }
  .header-title { font-size: 1.8rem; margin: 0; }
  .header-user-section { display: flex; align-items: center; gap: 1rem; }
  .user-name { font-weight: 600; }
  .login-button, .logout-button, .my-tickets-button { background-color: #e50914; color: white; padding: 8px 16px; border-radius: 5px; text-decoration: none; border: none; cursor: pointer; font-size: 1rem; }
  .my-tickets-button { background-color: transparent; border: 1px solid #e50914; }
  .movie-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 2rem; max-width: 1200px; margin: 2rem auto; }
  .movie-card-link { text-decoration: none; color: inherit; }
  .movie-card { background-color: #222; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.3); transition: transform 0.2s; display: flex; flex-direction: column; }
  .movie-card:hover { transform: scale(1.05); }
  .movie-poster-placeholder { width: 100%; padding-top: 150%; background-size: cover; background-position: center; background-color: #333; }
  .movie-title-container { padding: 1rem; flex-grow: 1; display: flex; align-items: center; justify-content: center; }
  .movie-title { font-size: 1rem; margin: 0; text-align: center; }
  .auth-page { display: flex; align-items: center; justify-content: center; min-height: 90vh; }
  .auth-container { background-color: #1F2937; padding: 2rem 3rem; border-radius: 12px; width: 100%; max-width: 400px; text-align: center; }
  .auth-container h2 { margin-top: 0; }
  .input-group { margin-bottom: 1.5rem; text-align: left; }
  .input-group label { display: block; margin-bottom: 5px; color: #9CA3AF; }
  .input-group input, .input-group select, .input-group textarea { width: 100%; padding: 12px; border-radius: 5px; border: 1px solid #374151; background-color: #374151; color: #F9FAFB; box-sizing: border-box; font-family: inherit; font-size: 1rem; }
  .input-group textarea { min-height: 100px; resize: vertical; }
  .auth-button { background-color: #EF4444; color: white; border: none; padding: 15px; font-size: 1.2rem; border-radius: 5px; cursor: pointer; width: 100%; }
  .auth-button:disabled { background-color: #374151; }
  .error-message { color: #F87171; margin-top: 1rem; }
  .switch-mode { margin-top: 1.5rem; color: #9CA3AF; }
  .admin-page { display: flex; justify-content: center; padding: 2rem; }
  .admin-container { background-color: #1F2937; padding: 2rem; border-radius: 12px; width: 100%; max-width: 800px; }
  .admin-container h1 { text-align: center; margin-top: 0; margin-bottom: 0.5rem; }
  .admin-container p { text-align: center; color: #9CA3AF; margin-bottom: 2rem; }
  .admin-actions { display: flex; justify-content: center; gap: 1rem; margin-bottom: 2rem; }
  .admin-actions button { background-color: #4F46E5; padding: 10px 20px; border: none; border-radius: 5px; color: white; font-size: 1rem; cursor: pointer; }
  .form-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1001; }
  .admin-form { background-color: #111827; padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; }
  .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  .form-header h2 { margin: 0; }
  .close-button { background: none; border: none; color: #9CA3AF; font-size: 2rem; cursor: pointer; line-height: 1; padding: 0; }
  .admin-form .submit-button { background-color: #2a9d8f; }
  .data-list { margin-top: 2rem; }
  .data-list h2 { border-top: 1px solid #444; padding-top: 2rem; }
  .data-item { display: flex; justify-content: space-between; align-items: center; background-color: #374151; padding: 1rem; border-radius: 5px; margin-bottom: 0.5rem; }
  .item-actions button { background-color: #F59E0B; border: none; color: white; padding: 5px 10px; border-radius: 3px; cursor: pointer; }
  .message { margin: 1rem 0; text-align: center; font-weight: 600; padding: 1rem; border-radius: 8px; }
  .success-message { color: #10B981; background-color: rgba(16, 185, 129, 0.1); }
  .message.error-message { background-color: rgba(248, 113, 113, 0.1); color: #F87171; }
  .movie-detail-container { display: flex; flex-direction: column; padding: 2rem; max-width: 1000px; margin: 0 auto; gap: 2.5rem; background-color: #1a1a1a; border-radius: 12px; }
  .detail-poster-placeholder { width: 100%; max-width: 300px; height: 450px; background-size: cover; background-position: center; border-radius: 8px; flex-shrink: 0; margin: 0 auto; background-color: #333; }
  @media (min-width: 768px) { .movie-detail-container { flex-direction: row; align-items: flex-start; } .detail-poster-placeholder { margin: 0; } }
  .detail-info { text-align: left; flex: 1; }
  .detail-info h1 { margin-top: 0; font-size: 2.8rem; }
  .detail-info h2 { margin-top: 2rem; border-bottom: 1px solid #444; padding-bottom: 0.5rem; }
  .detail-meta { display: flex; gap: 1rem; color: #aaa; margin-bottom: 1rem; }
  .synopsis-text { line-height: 1.6; color: #ddd; }
  .buy-ticket-button { background-color: #e50914; color: white; border: none; padding: 15px 30px; font-size: 1.2rem; border-radius: 5px; cursor: pointer; margin-top: 2rem; width: 100%; text-decoration: none; display: block; text-align: center;}
  .buy-ticket-button:disabled { background-color: #555; cursor: not-allowed; }
  .schedule-section { margin-top: 2rem; }
  .schedule-options { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem; }
  .schedule-button { background-color: #374151; border: 2px solid #4B5563; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; text-align: left; transition: all 0.2s; font-weight: 600; }
  .schedule-button:hover { background-color: #4B5563; }
  .schedule-button.selected { border-color: #A855F7; background-color: #A855F7; }
  .schedule-button .time { font-size: 1.1rem; }
  .schedule-button .studio { font-size: 0.8rem; color: #D1D5DB; display: block; margin-top: 2px;}
`;

export default App;
