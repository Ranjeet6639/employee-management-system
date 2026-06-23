const ConfirmModal = ({ title, message, onConfirm, onCancel, isConfirming }) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={isConfirming}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={isConfirming}>
            {isConfirming && <span className="spinner" />}
            {isConfirming ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
