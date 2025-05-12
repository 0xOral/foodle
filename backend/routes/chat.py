from flask import Flask, request, jsonify, send_from_directory
import mysql.connector
import os
from werkzeug.utils import secure_filename
import uuid

app = Flask(__name__)

# تكوين MySQL
db_config = {
    'host': 'localhost',
    'user': 'your_username',
    'password': 'your_password',
    'database': 'your_database'
}

# تكوين رفع الملفات
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx', 'txt'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# إنشاء مجلد التحميل إذا لم يكن موجودًا
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_db_connection():
    return mysql.connector.connect(**db_config)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# إنشاء مجموعة دردشة جديدة
@app.route('/groups', methods=['POST'])
def create_group():
    data = request.json
    group_name = data.get('name')

    if not group_name:
        return jsonify({'error': 'اسم المجموعة مطلوب'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO chat_groups (name) VALUES (%s)", (group_name,))
    conn.commit()
    group_id = cursor.lastrowid
    cursor.close()
    conn.close()

    return jsonify({'message': 'تم إنشاء المجموعة', 'group_id': group_id}), 201

# الحصول على جميع الرسائل لمجموعة معينة
@app.route('/chat/<int:group_id>', methods=['GET'])
def get_group_messages(group_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT m.id, m.sender, m.message, m.file_path, m.timestamp, m.is_deleted
        FROM messages m
        WHERE m.group_id = %s
        ORDER BY m.timestamp ASC
    """, (group_id,))
    messages = cursor.fetchall()
    cursor.close()
    conn.close()
    
    # معالجة الرسائل المحذوفة
    processed_messages = []
    for msg in messages:
        if msg['is_deleted']:
            msg['message'] = 'تم حذف هذه الرسالة'
            msg['file_path'] = None
        processed_messages.append(msg)
    
    return jsonify(processed_messages)

# إرسال رسالة إلى مجموعة (نص أو ملف)
@app.route('/chat/<int:group_id>', methods=['POST'])
def post_group_message(group_id):
    # التحقق من وجود المجموعة
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM chat_groups WHERE id = %s", (group_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({'error': 'المجموعة غير موجودة'}), 404

    # معالجة رفع الملف
    file_path = None
    if 'file' in request.files:
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)
    
    # الحصول على بيانات الرسالة
    sender = request.form.get('sender')
    message = request.form.get('message')

    if not sender or (not message and not file_path):
        if file_path:  # تنظيف الملف إذا فشل التحقق
            os.remove(file_path)
        cursor.close()
        conn.close()
        return jsonify({'error': 'المرسل والمحتوى (نص أو ملف) مطلوبان'}), 400

    # حفظ الرسالة في قاعدة البيانات
    cursor.execute(
        """INSERT INTO messages 
        (sender, message, group_id, file_path, is_deleted) 
        VALUES (%s, %s, %s, %s, %s)""",
        (sender, message, group_id, file_path, False)
    )
    conn.commit()
    message_id = cursor.lastrowid
    cursor.close()
    conn.close()

    return jsonify({
        'message': 'تم إرسال الرسالة إلى المجموعة',
        'message_id': message_id,
        'file_path': file_path
    }), 201

# تنزيل ملف مرفق
@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# تعديل رسالة
@app.route('/chat/message/<int:message_id>', methods=['PUT'])
def update_message(message_id):
    data = request.json
    new_message = data.get('message')

    if not new_message:
        return jsonify({'error': 'المحتوى الجديد مطلوب'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    
    # التحقق من وجود الرسالة
    cursor.execute("SELECT id FROM messages WHERE id = %s AND is_deleted = %s", 
                  (message_id, False))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({'error': 'الرسالة غير موجودة أو محذوفة'}), 404
    
    # تحديث الرسالة
    cursor.execute(
        "UPDATE messages SET message = %s WHERE id = %s",
        (new_message, message_id)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'تم تحديث الرسالة بنجاح'})

# حذف رسالة
@app.route('/chat/message/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # التحقق من وجود الرسالة
    cursor.execute("SELECT id, file_path FROM messages WHERE id = %s", (message_id,))
    message = cursor.fetchone()
    
    if not message:
        cursor.close()
        conn.close()
        return jsonify({'error': 'الرسالة غير موجودة'}), 404
    
    # حذف الرسالة (حذف ناعم)
    cursor.execute(
        "UPDATE messages SET is_deleted = %s WHERE id = %s",
        (True, message_id)
    )
    conn.commit()
    
    # حذف الملف المرفق إذا وجد
    if message[1]:
        try:
            os.remove(message[1])
        except OSError:
            pass
    
    cursor.close()
    conn.close()

    return jsonify({'message': 'تم حذف الرسالة بنجاح'})

if __name__ == '__main__':
    app.run(debug=True)