def get_welcome_email_template(user):
    """Email chào mừng"""
    return f"""
    <html>
    <body>
        <h2>Chào mừng {user.name} đến với Homely Store!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản.</p>
        <p>Email: {user.email}</p>
        <p>Bắt đầu mua sắm ngay: <a href="http://localhost:3000">Homely Store</a></p>
    </body>
    </html>
    """

def get_order_confirmation_template(order):
    """Email xác nhận đơn hàng"""
    items_html = ''.join([
        f"<li>{item.product_name} x {item.quantity} - {item.price:,.0f}đ</li>"
        for item in order.items.all()
    ])
    
    return f"""
    <html>
    <body>
        <h2>Xác nhận đơn hàng #{order.id}</h2>
        <p>Xin chào {order.user_name},</p>
        <p>Đơn hàng của bạn đã được xác nhận.</p>
        
        <h3>Chi tiết:</h3>
        <ul>{items_html}</ul>
        
        <p><strong>Tổng tiền: {order.total:,.0f}đ</strong></p>
        <p>Địa chỉ: {order.shipping_address}</p>
        <p>SĐT: {order.phone}</p>
    </body>
    </html>
    """