import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import type { User as UserType } from '../types';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onSave: (updatedData: Partial<UserType>) => Promise<void>;
}

export function ProfileEditModal({ isOpen, onClose, user, onSave }: ProfileEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2a2a2a] border-gray-700 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            <User className="w-6 h-6 text-[#8B7355]" />
            Chỉnh sửa thông tin cá nhân
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            Cập nhật thông tin cá nhân của bạn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div>
            <Label htmlFor="name" className="text-gray-300 flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              Họ và tên *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="bg-[#3a3a3a] border-gray-600 text-white"
              placeholder="Nhập họ tên"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-300 flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              Email *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="bg-[#3a3a3a] border-gray-600 text-white"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-gray-300 flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4" />
              Số điện thoại
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="bg-[#3a3a3a] border-gray-600 text-white"
              placeholder="0123456789"
            />
          </div>

          <div>
            <Label htmlFor="address" className="text-gray-300 flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" />
              Địa chỉ
            </Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="bg-[#3a3a3a] border-gray-600 text-white resize-none"
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-[#3a3a3a] border-gray-600 hover:bg-[#4a4a4a] text-white"
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#8B7355] hover:bg-[#6d5a43] text-white"
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}