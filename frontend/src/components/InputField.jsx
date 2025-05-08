import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';

function InputField({ onSend, onTyping }) {
  const [msg, setMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (msg.trim()) {
      onSend(msg);
      setMsg('');
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={msg}
          onChange={(e) => {
            setMsg(e.target.value)
            onTyping(true)
          }}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          style={styles.input}
          aria-label="Type your message"
        />
        <button
          type="submit"
          style={styles.button}
          disabled={!msg.trim()}
          aria-label="Send message"
        >
          <FiSend size={20} />
        </button>
      </div>
    </form>
  );
}

const styles = {
  form: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    // borderTop: '1px solid #e0e0e0',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#e4e6e9',
    borderRadius: '24px',
    padding: '4px 12px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    padding: '10px 8px',
    fontSize: '15px',
    color: '#333',
    '&:focus': {
      outline: 'none',
    },
    '::placeholder': {
      color: '#999',
    },
  },
  button: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    color: '#4a90e2',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#e8f4ff',
      color: '#3a7bc8',
    },
    '&:disabled': {
      color: '#ccc',
      cursor: 'not-allowed',
    },
    '&:active': {
      transform: 'scale(0.95)',
    },
  },
};

export default InputField;