from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Chat, Message
from datetime import datetime

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/api/chats', methods=['GET'])
@jwt_required()
def get_chats():
    try:
        user_id = get_jwt_identity()
        print(f"Getting chats for user_id: {user_id}")  # Debug log
        
        user = User.query.get(user_id)
        if not user:
            print(f"User not found: {user_id}")  # Debug log
            return jsonify({'message': 'User not found'}), 404
        
        # Get all chats where the user is a participant
        chats = Chat.query.filter(Chat.participants.contains(user)).all()
        print(f"Found {len(chats)} chats")  # Debug log
        
        chats_data = []
        for chat in chats:
            try:
                print(f"Processing chat {chat.id}")  # Debug log
                print(f"Chat participants: {[p.id for p in chat.participants]}")  # Debug log
                
                # Get the other participant (not the current user)
                other_participant = next(p for p in chat.participants if p.id != user_id)
                if not other_participant:
                    print(f"No other participant found for chat {chat.id}")  # Debug log
                    continue
                
                print(f"Other participant: {other_participant.username}")  # Debug log
                
                # Get the last message using Message model
                last_message = Message.query.filter_by(chat_id=chat.id).order_by(Message.timestamp.desc()).first()
                print(f"Last message: {last_message.content if last_message else 'None'}")  # Debug log
                
                # Count unread messages
                unread_count = Message.query.filter(
                    Message.chat_id == chat.id,
                    Message.sender_id != user_id,
                    Message.is_read == False
                ).count()
                print(f"Unread count: {unread_count}")  # Debug log
                
                chat_data = {
                    'id': str(chat.id),
                    'participant': {
                        'id': str(other_participant.id),
                        'username': other_participant.username,
                        'profilePicture': getattr(other_participant, 'profilePicture', "placeholder.svg")
                    },
                    'lastMessage': {
                        'content': last_message.content if last_message else None,
                        'timestamp': last_message.timestamp.isoformat() if last_message else None,
                        'senderId': str(last_message.sender_id) if last_message else None
                    } if last_message else None,
                    'unreadCount': unread_count
                }
                print(f"Chat data: {chat_data}")  # Debug log
                chats_data.append(chat_data)
                
            except Exception as e:
                print(f"Error processing chat {chat.id}: {str(e)}")  # Debug log
                print(f"Error details: {type(e).__name__}")  # Debug log
                continue
        
        print(f"Returning {len(chats_data)} processed chats")  # Debug log
        return jsonify({'chats': chats_data}), 200
        
    except Exception as e:
        print(f"Error in get_chats: {str(e)}")  # Debug log
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@chat_bp.route('/api/chats', methods=['POST'])
@jwt_required()
def create_chat():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    participant_id = data.get('participantId')
    if not participant_id:
        return jsonify({'message': 'Participant ID is required'}), 400
    
    # Check if chat already exists
    user = User.query.get(user_id)
    participant = User.query.get(participant_id)
    
    if not participant:
        return jsonify({'message': 'Participant not found'}), 404
    
    # Check for existing chat
    existing_chat = Chat.query.filter(
        Chat.participants.contains(user),
        Chat.participants.contains(participant)
    ).first()
    
    if existing_chat:
        return jsonify({
            'message': 'Chat already exists',
            'chatId': str(existing_chat.id)
        }), 200
    
    # Create new chat
    chat = Chat()
    chat.participants.append(user)
    chat.participants.append(participant)
    
    try:
        db.session.add(chat)
        db.session.commit()
        return jsonify({
            'message': 'Chat created successfully',
            'chatId': str(chat.id),
            'chat': {
                'id': str(chat.id),
                'participant': {
                    'id': str(participant.id),
                    'username': participant.username,
                    'profilePicture': participant.profilePicture
                },
                'lastMessage': None,
                'unreadCount': 0
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@chat_bp.route('/api/chats/<chat_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(chat_id):
    try:
        user_id = get_jwt_identity()
        print(f"Getting messages for chat {chat_id} by user {user_id}")  # Debug log
        
        # Get the chat and verify the user is a participant
        chat = Chat.query.get(chat_id)
        if not chat:
            print(f"Chat not found: {chat_id}")  # Debug log
            return jsonify({'message': 'Chat not found'}), 404
            
        user = User.query.get(user_id)
        if not user:
            print(f"User not found: {user_id}")  # Debug log
            return jsonify({'message': 'User not found'}), 404
            
        if user not in chat.participants:
            print(f"User {user_id} is not a participant in chat {chat_id}")  # Debug log
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Get all messages for this chat
        messages = Message.query.filter_by(chat_id=chat_id).order_by(Message.timestamp.asc()).all()
        print(f"Found {len(messages)} messages")  # Debug log
        
        # Mark messages as read
        unread_messages = Message.query.filter(
            Message.chat_id == chat_id,
            Message.sender_id != user_id,
            Message.is_read == False
        ).all()
        
        for message in unread_messages:
            message.is_read = True
            
        try:
            db.session.commit()
        except Exception as e:
            print(f"Error marking messages as read: {str(e)}")  # Debug log
            db.session.rollback()
        
        messages_data = [{
            'id': str(message.id),
            'content': message.content,
            'timestamp': message.timestamp.isoformat(),
            'senderId': str(message.sender_id),
            'isRead': message.is_read
        } for message in messages]
        
        print(f"Returning {len(messages_data)} messages")  # Debug log
        return jsonify({'messages': messages_data}), 200
        
    except Exception as e:
        print(f"Error in get_messages: {str(e)}")  # Debug log
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@chat_bp.route('/api/chats/<chat_id>/messages', methods=['POST'])
@jwt_required()
def send_message(chat_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({'message': 'Chat not found'}), 404
    
    if user not in chat.participants:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    content = data.get('content')
    
    if not content:
        return jsonify({'message': 'Message content is required'}), 400
    
    message = Message(
        content=content,
        chat_id=chat_id,
        sender_id=user_id
    )
    
    try:
        db.session.add(message)
        db.session.commit()
        
        # Get the other participant
        other_participant = next(p for p in chat.participants if p.id != user_id)
        
        return jsonify({
            'message': 'Message sent successfully',
            'message': {
                'id': str(message.id),
                'content': message.content,
                'timestamp': message.timestamp.isoformat(),
                'senderId': str(message.sender_id),
                'senderUsername': message.sender.username,
                'isRead': message.is_read
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500 