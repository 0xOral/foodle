from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

# Association table for user–course many-to-many
user_courses = db.Table('user_courses',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('courseId', db.Integer, db.ForeignKey('course.id'))

)

# Association table for post likes
post_likes = db.Table('post_likes',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('post_id', db.Integer, db.ForeignKey('post.id'))
)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)
    karma = db.Column(db.Integer, default=0)
    courses = db.relationship('Course', secondary=user_courses, back_populates='enrolledStudents')
    posts = db.relationship('Post', backref='user', cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='user', cascade='all, delete-orphan')
    liked_posts = db.relationship('Post', 
        secondary=post_likes,
        backref=db.backref('liked_by', lazy='dynamic'))

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True, nullable=False)
    code = db.Column(db.String(128), unique=True, nullable=False)
    description = db.Column(db.String(128), nullable=False)
    instructor = db.Column(db.String(128), nullable=False)
    enrolledStudents = db.relationship('User', secondary=user_courses, back_populates='courses')
    posts = db.relationship('Post', backref='course', cascade='all, delete-orphan')


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    courseId = db.Column(db.Integer, db.ForeignKey('course.id'))
    comments = db.relationship('Comment', backref='post', cascade='all, delete-orphan')
    image = db.Column(db.String(255), nullable=True)
    likes = db.Column(db.Integer, default=0)

    def is_liked_by(self, user):
        return user in self.liked_by


class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'))
    likes = db.Column(db.Integer, default=0)

class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    participants = db.relationship('User', secondary='chat_participants', backref=db.backref('chats', lazy='dynamic'))
    messages = db.relationship('Message', backref='chat', cascade='all, delete-orphan')

# Association table for chat participants
chat_participants = db.Table('chat_participants',
    db.Column('chat_id', db.Integer, db.ForeignKey('chat.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'))
)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id'))
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    sender = db.relationship('User', backref=db.backref('messages', lazy='dynamic'))
    is_read = db.Column(db.Boolean, default=False)