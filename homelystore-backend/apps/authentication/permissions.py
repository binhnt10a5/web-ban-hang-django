from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """Chỉ admin mới có quyền"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )

class IsOwnerOrAdmin(permissions.BasePermission):
    """Owner hoặc admin mới có quyền"""
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        
        # Check if obj has user field
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False