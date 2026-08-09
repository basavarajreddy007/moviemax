import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiXMark, HiBookmark, HiPlus, HiCheck } from "react-icons/hi2";
import toast from "react-hot-toast";

export default function SavePlaylistModal({ isOpen, onClose, videoTitle = "" }) {
  const [playlists, setPlaylists] = useState([
    { id: "watch-later", name: "Watch Later", isSaved: true },
    { id: "favorites", name: "Favorites", isSaved: false },
    { id: "sci-fi", name: "Sci-Fi & Action Masterpieces", isSaved: false },
    { id: "weekend", name: "Weekend Binge List", isSaved: false }
  ]);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const togglePlaylist = (id) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === id) {
          const newState = !pl.isSaved;
          toast.success(newState ? `Added to "${pl.name}"` : `Removed from "${pl.name}"`);
          return { ...pl, isSaved: newState };
        }
        return pl;
      })
    );
  };

  const handleCreateNew = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const newPl = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      isSaved: true
    };
    setPlaylists((prev) => [...prev, newPl]);
    setNewPlaylistName("");
    setShowCreateNew(false);
    toast.success(`Created playlist "${newPl.name}" and saved video!`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="player-modal-backdrop" onClick={onClose}>
          <motion.div
            className="player-modal-card playlist-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="player-modal-header">
              <div className="player-modal-title">
                <HiBookmark className="text-cyan-400 text-xl" />
                <h3>Save Video To...</h3>
              </div>
              <button className="player-modal-close-btn" onClick={onClose}>
                <HiXMark />
              </button>
            </div>

            <div className="playlist-content">
              <div className="playlist-items-list">
                {playlists.map((pl) => (
                  <label key={pl.id} className="playlist-check-row">
                    <input
                      type="checkbox"
                      checked={pl.isSaved}
                      onChange={() => togglePlaylist(pl.id)}
                    />
                    <span className="playlist-name">{pl.name}</span>
                  </label>
                ))}
              </div>

              {showCreateNew ? (
                <form onSubmit={handleCreateNew} className="create-playlist-form">
                  <input
                    type="text"
                    placeholder="Enter playlist title..."
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    autoFocus
                  />
                  <div className="create-playlist-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowCreateNew(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit">
                      Create
                    </button>
                  </div>
                </form>
              ) : (
                <button className="create-new-playlist-btn" onClick={() => setShowCreateNew(true)}>
                  <HiPlus /> Create new playlist
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
