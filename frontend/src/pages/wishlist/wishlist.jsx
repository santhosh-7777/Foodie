import { useEffect, useState, useContext } from 'react';
import { StoreContext } from '../../components/context/StoreContext';
import FoodItem from '../../components/FoodItem/FoodItem';
import { toast } from 'react-hot-toast';
import { Share2, Check, QrCode, Lock, Unlock } from 'lucide-react';
import QRCode from '../../components/QRCode/QRCode';
import "./wishlist.css";

const Wishlist = () => {
  const { food_list, wishlistItems } = useContext(StoreContext);
  const [wishlistedItems, setWishlistedItems] = useState([]);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Load user and wishlist items
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    const privacySetting = localStorage.getItem(`wishlist_privacy_${storedUser?.email || 'anonymous'}`);
    setIsPublic(privacySetting === 'public');

    updateWishlist();
  }, [wishlistItems, food_list]);

  const updateWishlist = () => {
    const filtered = food_list.filter(food => wishlistItems[food._id]);
    setWishlistedItems(filtered);
  };

  // Generate share link
  const generateShareLink = () => {
    if (!user) {
      const demoUser = { name: 'Demo User', email: 'demo@example.com' };
      setUser(demoUser);
    }

    const wishlistIds = Object.keys(wishlistItems);
    if (wishlistIds.length === 0) {
      toast.error('Your wishlist is empty!');
      return;
    }

    const userId = user.email || user.name || 'user';
    const shareId = btoa(userId).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);

    const sharedWishlistData = {
      wishlistIds,
      userName: user.name || 'Anonymous',
      createdAt: new Date().getTime(),
      viewCount: 0
    };

    localStorage.setItem(`shared_wishlist_${shareId}`, JSON.stringify(sharedWishlistData));

    const url = `${window.location.origin}/wishlist/${shareId}`;
    return url;
  };

  // Copy share link
  const handleShareWishlist = async () => {
    const url = generateShareLink();
    if (!url) return;

    setShareUrl(url);

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Wishlist link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      setCopied(true);
      toast.success('Wishlist link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Show QR Code
  const handleShowQRCode = () => {
    const url = generateShareLink();
    if (!url) return;

    setShareUrl(url);
    setShowQRCode(true);
  };

  // Toggle privacy
  const handlePrivacyToggle = () => {
    if (!user) {
      const demoUser = { name: 'Demo User', email: 'demo@example.com' };
      setUser(demoUser);
    }

    const newPrivacy = !isPublic;
    setIsPublic(newPrivacy);

    const privacyKey = `wishlist_privacy_${user.email || 'anonymous'}`;
    localStorage.setItem(privacyKey, newPrivacy ? 'public' : 'private');

    toast.success(`Wishlist is now ${newPrivacy ? 'public' : 'private'}`);
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h2>💖 Your Wishlist</h2>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
          Items in wishlist: {wishlistedItems.length}
        </div>

        {wishlistedItems.length > 0 && (
          <div className="wishlist-controls">
            <div className="share-buttons">
              <button className="share-wishlist-btn" onClick={handleShareWishlist} disabled={copied}>
                {copied ? (<><Check size={16} /><span>Copied!</span></>) : (<><Share2 size={16} /><span>Copy Link</span></>)}
              </button>
              <button className="qr-code-btn" onClick={handleShowQRCode}>
                <QrCode size={16} />
                <span>QR Code</span>
              </button>
            </div>
            <button
              className={`privacy-toggle-btn ${isPublic ? 'public' : 'private'}`}
              onClick={handlePrivacyToggle}
              title={`Make wishlist ${isPublic ? 'private' : 'public'}`}
            >
              {isPublic ? (<><Unlock size={16} /><span>Public</span></>) : (<><Lock size={16} /><span>Private</span></>)}
            </button>
          </div>
        )}
      </div>

      {wishlistedItems.length === 0 ? (
        <p>No items wishlisted yet!</p>
      ) : (
        <div className="food-display-list">
          {wishlistedItems.map(item => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
              // Heart click will handle add/remove from wishlist
            />
          ))}
        </div>
      )}

      {showQRCode && (
        <QRCode
          url={shareUrl}
          onClose={() => setShowQRCode(false)}
        />
      )}
    </div>
  );
};

export default Wishlist;
