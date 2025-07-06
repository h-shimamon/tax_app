import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // 顧客リストの状態
  const [customers, setCustomers] = useState([]);
  // 新規顧客フォームの状態
  const [newCustomer, setNewCustomer] = useState({ name: '', contact_person: '', email: '' });
  
  // 更新機能のための状態
  const [editingId, setEditingId] = useState(null); // どの顧客を編集中かを示すID
  const [editingData, setEditingData] = useState({ name: '', contact_person: '', email: '' });

  // タスク管理のための状態
  const [selectedCustomerId, setSelectedCustomerId] = useState(null); // 選択中の顧客ID
  const [tasks, setTasks] = useState([]); // 選択中の顧客のタスクリスト

  // --- データ取得 ---
  useEffect(() => {
    axios.get('http://localhost:3001/api/customers')
      .then(response => setCustomers(response.data))
      .catch(error => console.error('データの取得に失敗しました', error));
  }, []);

  // --- イベントハンドラ ---

  // 新規顧客フォームの入力処理
  const handleInputChange = (e) => {
    setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
  };

  // 新規顧客フォームの送信処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/customers', newCustomer);
      setCustomers([...customers, response.data]);
      setNewCustomer({ name: '', contact_person: '', email: '' });
    } catch (error) {
      console.error('顧客の作成に失敗しました', error);
    }
  };

  // 削除ボタンの処理
  const handleDelete = async (id) => {
    if (window.confirm('本当にこの顧客を削除しますか？')) {
      try {
        await axios.delete(`http://localhost:3001/api/customers/${id}`);
        setCustomers(customers.filter(customer => customer.id !== id));
      } catch (error) {
        console.error('顧客の削除に失敗しました', error);
      }
    }
  };

  // 「編集」ボタンの処理
  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setEditingData({ name: customer.name, contact_person: customer.contact_person, email: customer.email });
  };

  // 編集フォームの入力処理
  const handleUpdateChange = (e) => {
    setEditingData({ ...editingData, [e.target.name]: e.target.value });
  };
  
  // 「保存」ボタンの処理
  const handleUpdate = async (id) => {
    try {
      const response = await axios.put(`http://localhost:3001/api/customers/${id}`, editingData);
      setCustomers(customers.map(customer => (customer.id === id ? response.data : customer)));
      setEditingId(null);
    } catch (error) {
      console.error('顧客の更新に失敗しました', error);
    }
  };
  
  // 顧客が選択されたときの処理
  const handleCustomerSelect = async (id) => {
    // 編集モード中は顧客選択を無効にする
    if (editingId !== null) return; 

    try {
      setSelectedCustomerId(id);
      const response = await axios.get(`http://localhost:3001/api/customers/${id}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('タスクの取得に失敗しました', error);
      setTasks([]); // エラーの場合はタスクを空にする
    }
  };

  return (
    <div className="app-container">
      {/* ★★★ ここから新規顧客追加フォーム（復活） ★★★ */}
      <div className="form-container">
        <h2>新規顧客追加</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="顧客名"
            value={newCustomer.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="contact_person"
            placeholder="担当者名"
            value={newCustomer.contact_person}
            onChange={handleInputChange}
          />
          <input
            type="email"
            name="email"
            placeholder="メールアドレス"
            value={newCustomer.email}
            onChange={handleInputChange}
          />
          <button type="submit">追加</button>
        </form>
      </div>
      {/* ★★★ 新規顧客追加フォームここまで ★★★ */}

      <h1>顧客一覧</h1>
      <div className="customer-list">
        <ul>
          {customers.map((customer) => (
            <li 
              key={customer.id} 
              className={selectedCustomerId === customer.id ? 'selected' : ''}
              onClick={() => handleCustomerSelect(customer.id)}
            >
              {editingId === customer.id ? (
                // ★★★ ここから編集モードのフォーム（復活） ★★★
                <>
                  <input type="text" name="name" value={editingData.name} onChange={handleUpdateChange} className="edit-input" />
                  <input type="text" name="contact_person" value={editingData.contact_person} onChange={handleUpdateChange} className="edit-input" />
                  <button onClick={() => handleUpdate(customer.id)} className="save-btn">保存</button>
                </>
              ) : (
                // ★★★ ここから通常時の表示（ボタンも復活） ★★★
                <>
                  <span>{customer.name} （担当者: {customer.contact_person}）</span>
                  <div>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(customer); }} className="edit-btn">編集</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }} className="delete-btn">削除</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* タスク表示エリア */}
      {selectedCustomerId && (
        <div className="task-container">
          <h2>タスク一覧</h2>
          {tasks.length > 0 ? (
            <ul>
              {tasks.map(task => (
                <li key={task.id}>
                  {task.title} (ステータス: {task.status})
                </li>
              ))}
            </ul>
          ) : (
            <p>この顧客のタスクはありません。</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;