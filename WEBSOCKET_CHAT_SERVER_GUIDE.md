# WebSocket Chat Server Implementation Guide

## Overview
This guide covers the implementation of a secure, real-time chat server using WebSocket technology with authentication, database integration, and proper error handling.

## Features Implemented

### ✅ Authentication & Security
- JWT token-based authentication for WebSocket connections
- User validation against database
- Group membership verification
- Rate limiting (10 messages per minute per user)
- Secure connection handling

### ✅ Database Integration
- MySQL database integration using existing connection pool
- Message persistence in `group_messages` table
- Recent message retrieval on connection
- User and group validation

### ✅ Real-time Communication
- WebSocket connections with compression
- Group-based message broadcasting
- User join/leave notifications
- Connection status tracking

### ✅ Error Handling & Monitoring
- Comprehensive error handling
- Health check endpoint
- Graceful shutdown
- Connection logging

## Installation & Setup

### 1. Install Dependencies
The `ws` package is already installed in the backend:
```bash
cd backend
npm install
```

### 2. Environment Configuration
Add these environment variables to your `.env` file:
```env
# Chat Server Configuration
CHAT_PORT=3001
JWT_SECRET=your-secret-key-change-in-production

# Database Configuration (if not already set)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=forward_africa_db
DB_PORT=3306
```

### 3. Start the Chat Server
```bash
# Production mode
npm run chat

# Development mode with auto-restart
npm run chat:dev
```

## WebSocket Connection

### Connection URL Format
```
ws://localhost:3001/group/{groupId}?token={jwt_token}
```

### Authentication
- Pass JWT token as query parameter: `?token=your_jwt_token`
- Or in Authorization header: `Authorization: Bearer your_jwt_token`

### Example Connection
```javascript
const token = 'your_jwt_token_here';
const groupId = 'group1';
const ws = new WebSocket(`ws://localhost:3001/group/${groupId}?token=${token}`);
```

## Message Format

### Sending Messages
```javascript
// Text message
ws.send(JSON.stringify({
  content: "Hello, everyone!",
  messageType: "text" // optional, defaults to "text"
}));

// File/image message
ws.send(JSON.stringify({
  content: "Check out this image!",
  messageType: "image",
  fileUrl: "https://example.com/image.jpg"
}));
```

### Receiving Messages
```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch(data.type) {
    case 'connection_established':
      console.log('Connected to chat:', data.user);
      break;

    case 'recent_messages':
      console.log('Recent messages:', data.messages);
      break;

    case 'message':
      console.log('New message:', data);
      break;

    case 'user_joined':
      console.log('User joined:', data.user);
      break;

    case 'user_left':
      console.log('User left:', data.user);
      break;

    case 'error':
      console.error('Error:', data.message);
      break;
  }
};
```

## Database Schema

### Group Messages Table
```sql
CREATE TABLE group_messages (
    id VARCHAR(36) PRIMARY KEY,
    group_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file', 'link') DEFAULT 'text',
    file_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## API Endpoints

### Health Check
```
GET http://localhost:3001/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "connections": {
    "total": 5,
    "groups": 2,
    "users": 3
  }
}
```

## Security Features

### Authentication Flow
1. Client provides JWT token in connection request
2. Server validates token signature and expiration
3. Server verifies user exists and is active in database
4. Server validates user membership in the requested group
5. Connection established only after all validations pass

### Rate Limiting
- Maximum 10 messages per minute per user per group
- Automatic rate limit reset after 60 seconds
- Error response when limit exceeded

### Error Handling
- Comprehensive error messages with codes
- Graceful connection closure on authentication failure
- Database error handling with fallbacks

## Frontend Integration

### React/Next.js Example
```javascript
import { useEffect, useState, useRef } from 'react';

const useChatWebSocket = (groupId, token) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!groupId || !token) return;

    const ws = new WebSocket(`ws://localhost:3001/group/${groupId}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch(data.type) {
        case 'connection_established':
          console.log('Chat connected:', data.user);
          break;

        case 'recent_messages':
          setMessages(data.messages);
          break;

        case 'message':
          setMessages(prev => [...prev, data]);
          break;

        case 'user_joined':
          // Handle user joined notification
          break;

        case 'user_left':
          // Handle user left notification
          break;

        case 'error':
          setError(data.message);
          break;
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [groupId, token]);

  const sendMessage = (content, messageType = 'text', fileUrl = null) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        content,
        messageType,
        fileUrl
      }));
    }
  };

  return {
    messages,
    isConnected,
    error,
    sendMessage
  };
};

// Usage in component
const ChatComponent = ({ groupId, token }) => {
  const { messages, isConnected, error, sendMessage } = useChatWebSocket(groupId, token);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <div className="status">
        Status: {isConnected ? 'Connected' : 'Disconnected'}
      </div>

      <div className="messages">
        {messages.map(msg => (
          <div key={msg.messageId} className="message">
            <strong>{msg.sender.full_name}</strong>: {msg.content}
          </div>
        ))}
      </div>

      <div className="input">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSend} disabled={!isConnected}>
          Send
        </button>
      </div>
    </div>
  );
};
```

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
CHAT_PORT=3001
JWT_SECRET=your-super-secure-secret-key
DB_HOST=your-database-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=forward_africa_db
DB_PORT=3306
```

### Process Management
Use PM2 for production deployment:
```bash
npm install -g pm2
pm2 start chatServer.js --name "chat-server"
pm2 save
pm2 startup
```

### Load Balancer Configuration
If using multiple chat server instances:
```nginx
upstream chat_servers {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    server_name your-domain.com;

    location /chat/ {
        proxy_pass http://chat_servers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring & Logging

### Health Monitoring
- Health check endpoint: `GET /health`
- Monitor connection counts and group activity
- Set up alerts for connection drops

### Logging
The server provides comprehensive logging:
- Connection events
- Authentication attempts
- Message processing
- Error conditions

### Performance Metrics
- Total active connections
- Messages per second
- Group activity levels
- Error rates

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify JWT token is valid and not expired
   - Check user exists and is active in database
   - Ensure user is a member of the group

2. **Connection Refused**
   - Verify chat server is running on correct port
   - Check firewall settings
   - Ensure database is accessible

3. **Messages Not Saving**
   - Check database connection
   - Verify `group_messages` table exists
   - Check database permissions

4. **Rate Limiting**
   - Wait 60 seconds before sending more messages
   - Implement client-side rate limiting
   - Consider increasing limits for premium users

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=websocket:*
```

## Next Steps

### Future Enhancements
1. **Message Encryption**: End-to-end encryption for sensitive messages
2. **File Upload**: Direct file upload to chat server
3. **Message Reactions**: Like, heart, etc. reactions
4. **Message Editing**: Edit/delete message functionality
5. **Typing Indicators**: Show when users are typing
6. **Message Search**: Search through chat history
7. **Push Notifications**: Notify users of new messages
8. **Message Threading**: Reply to specific messages

### Scaling Considerations
1. **Redis Integration**: Use Redis for session management
2. **Multiple Instances**: Load balance across multiple chat servers
3. **Database Sharding**: Shard messages by group or time
4. **CDN Integration**: Serve static assets through CDN
5. **Monitoring**: Implement comprehensive monitoring and alerting

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify database connectivity
3. Test authentication tokens
4. Monitor server resources
5. Review network connectivity

The chat server is now fully functional with all requested features implemented!