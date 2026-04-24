import { useState, useEffect } from 'react';
import { ShoppingBag, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: string;
  name: string;
  product: string;
  location: string;
  timeAgo: string;
}

const notifications: Notification[] = [
  { id: '1', name: 'Nguyễn V***', product: 'Ghế Sofa Hiện Đại', location: 'TP. Hồ Chí Minh', timeAgo: '2 phút trước' },
  { id: '2', name: 'Trần T***', product: 'Bàn Ăn Gỗ Sồi', location: 'Hà Nội', timeAgo: '5 phút trước' },
  { id: '3', name: 'Lê V***', product: 'Tủ Quần Áo', location: 'Đà Nẵng', timeAgo: '8 phút trước' },
  { id: '4', name: 'Phạm T***', product: 'Giường Ngủ Cao Cấp', location: 'Cần Thơ', timeAgo: '12 phút trước' },
  { id: '5', name: 'Hoàng V***', product: 'Bàn Làm Việc', location: 'Hải Phòng', timeAgo: '15 phút trước' },
];

export function SocialProofNotification() {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Show first notification after 5 seconds
    const initialDelay = setTimeout(() => {
      showNextNotification();
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, []);

  const showNextNotification = () => {
    setIsVisible(true);
    setCurrentNotification(notifications[currentIndex]);
    
    // Hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    // Show next notification after 20 seconds
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
      showNextNotification();
    }, 20000);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && currentNotification && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed bottom-24 left-4 z-50 max-w-sm"
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 flex items-start gap-3">
            {/* Icon */}
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-gray-900">
                  {currentNotification.name}
                </p>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                vừa mua <span className="font-medium text-gray-900">{currentNotification.product}</span>
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {currentNotification.location}
                </div>
                <span>{currentNotification.timeAgo}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
