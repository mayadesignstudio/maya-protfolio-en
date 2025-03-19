// Integrated functionality for mouse and touch support
(function() {
    // Shared variables
    let scale = 1;
    let posX = 0;
    let posY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentScale = 1;
    let startScale = 1;
    let initialDistance = 0;
    let lastDistance = 0;
    
    const zoomImage = document.getElementById('zoom-image');
    const zoomModal = document.querySelector('.zoom-modal');
    const zoomClose = document.querySelector('.zoom-close');
    const zoomIn = document.querySelector('.zoom-in');
    const zoomOut = document.querySelector('.zoom-out');
    const zoomReset = document.querySelector('.zoom-reset');
    const zoomIcon = document.querySelector('.zoom-icon');
    
    // Check if device is mobile
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Function to update image transform
    function updateTransform() {
        zoomImage.style.transform = `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px)) scale(${scale})`;
    }
    
    // Reset zoom function
    function resetZoom() {
        scale = 1;
        posX = 0;
        posY = 0;
        currentScale = 1;
        updateTransform();
    }
    
    // Calculate distance between two touch points
    function getDistance(touch1, touch2) {
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) + 
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    }
    
    // Open modal function
    function openModal(imageSrc) {
        zoomModal.classList.add('show');
        zoomImage.src = imageSrc;
        document.body.style.overflow = 'hidden';
        resetZoom();
    }

    // Close modal function
    function closeModal() {
        zoomModal.classList.remove('show');
        document.body.style.overflow = '';
        setTimeout(() => {
            zoomImage.src = '';
            resetZoom();
        }, 400);
    }
    
    // ===== Mouse event handling (for desktop) =====
    
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
        // Remove previous wheel listeners
        const oldListeners = zoomImage.getEventListeners?.('wheel') || [];
        oldListeners.forEach(listener => {
            zoomImage.removeEventListener('wheel', listener.listener);
        });
        
        // New wheel behavior
        zoomImage.addEventListener('wheel', function(e) {
            e.preventDefault();
            
            // If Shift is pressed - still allow zoom
            if (e.shiftKey) {
                if (e.deltaY < 0) {
                    scale += 0.2;
                    if (scale > 5) scale = 5;
                } else {
                    scale -= 0.2;
                    if (scale < 1) scale = 1;
                    if (scale === 1) {
                        posX = 0;
                        posY = 0;
                    }
                }
            } 
            // Otherwise, if already zoomed - allow scrolling up/down
            else if (scale > 1) {
                const scrollSpeed = 30 / scale; // Scroll speed adjusted to zoom
                posY += e.deltaY < 0 ? scrollSpeed : -scrollSpeed;
                
                // Limit scrolling to image frame
                const maxOffset = (scale - 1) * Math.min(zoomImage.width, zoomImage.height) / 2;
                posY = Math.min(Math.max(-maxOffset, posY), maxOffset);
            }
            // If not zoomed and Shift not pressed - still allow normal zoom
            else {
                if (e.deltaY < 0) {
                    scale += 0.2;
                } else {
                    scale = 1;
                }
            }
            
            updateTransform();
        }, { passive: false });
        
        // Add usage tip
        const zoomModalContent = document.querySelector('.zoom-modal-content');
        const zoomTip = document.createElement('div');
        zoomTip.className = 'zoom-scroll-tip';
        zoomTip.innerText = 'Mouse wheel: Scroll | SHIFT+wheel: Zoom';
        zoomTip.style.position = 'absolute';
        zoomTip.style.bottom = '80px';
        zoomTip.style.left = '50%';
        zoomTip.style.transform = 'translateX(-50%)';
        zoomTip.style.background = 'rgba(0,0,0,0.6)';
        zoomTip.style.color = 'white';
        zoomTip.style.padding = '8px 15px';
        zoomTip.style.borderRadius = '20px';
        zoomTip.style.fontSize = '14px';
        zoomTip.style.opacity = '0';
        zoomTip.style.transition = 'opacity 0.5s';
        zoomModalContent.appendChild(zoomTip);
        
        // Show tip for a few seconds when opening modal
        zoomModal.addEventListener('click', function(e) {
            if (e.target === this || e.target.className === 'zoom-modal-content') {
                zoomTip.style.opacity = '1';
                setTimeout(() => {
                    zoomTip.style.opacity = '0';
                }, 3000);
            }
        });
    }
    
    // Start dragging
    zoomImage.addEventListener('mousedown', function(e) {
        if (scale > 1) {
            isDragging = true;
            startX = e.clientX - posX;
            startY = e.clientY - posY;
            e.preventDefault();
        }
    });
    
    // Drag image
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            posX = e.clientX - startX;
            posY = e.clientY - startY;
            updateTransform();
        }
    });
    
    // Stop dragging
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
    
    // ===== Touch event handling (for mobile) =====
    if (isTouchDevice) {
        // Start touch
        zoomImage.addEventListener('touchstart', function(e) {
            if (e.touches.length === 2) {
                // Two fingers - for zoom
                lastDistance = getDistance(e.touches[0], e.touches[1]);
                e.preventDefault();
            } else if (e.touches.length === 1 && scale > 1) {
                // One finger for pan (after zoom)
                startX = e.touches[0].clientX - posX;
                startY = e.touches[0].clientY - posY;
            }
        });
        
        // Touch movement
        zoomImage.addEventListener('touchmove', function(e) {
            if (e.touches.length === 2) {
                // Zoom with two fingers
                e.preventDefault();
                const currentDistance = getDistance(e.touches[0], e.touches[1]);
                const factor = currentDistance / lastDistance;
                
                const newScale = scale * factor;
                scale = Math.min(Math.max(0.5, newScale), 5);
                
                lastDistance = currentDistance;
                
                if (scale <= 1) {
                    posX = 0;
                    posY = 0;
                }
                
                updateTransform();
            } else if (e.touches.length === 1 && scale > 1) {
                // Pan with one finger
                posX = e.touches[0].clientX - startX;
                posY = e.touches[0].clientY - startY;
                
                updateTransform();
            }
        }, { passive: false });
        
        // End touch
        zoomImage.addEventListener('touchend', function() {
            if (scale <= 1) {
                posX = 0;
                posY = 0;
                updateTransform();
            }
        });
        
        // Double tap to zoom
        let lastTap = 0;
        zoomImage.addEventListener('touchend', function(e) {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 300 && tapLength > 0) {
                e.preventDefault();
                if (scale === 1) {
                    scale = 2.5;
                } else {
                    scale = 1;
                    posX = 0;
                    posY = 0;
                }
                updateTransform();
            }
            lastTap = currentTime;
        });
    }
    
    // ===== Shared buttons =====
    
    // Zoom in button
    zoomIn.addEventListener('click', function() {
        scale = Math.min(5, scale + 0.2);
        updateTransform();
    });
    
    // Zoom out button
    zoomOut.addEventListener('click', function() {
        scale = Math.max(0.5, scale - 0.2);
        if (scale <= 1) {
            posX = 0;
            posY = 0;
        }
        updateTransform();
    });
    
    // Reset button
    zoomReset.addEventListener('click', resetZoom);
    
    // Close modal
    zoomClose.addEventListener('click', closeModal);
    
    // Close modal when clicking outside image
    zoomModal.addEventListener('click', function(e) {
        if (e.target === zoomModal) {
            closeModal();
        }
    });
    
    // Prevent content scrolling in modal when image is zoomed
    zoomModal.addEventListener('wheel', function(e) {
        if (scale > 1) {
            e.preventDefault();
        }
    });
    
    // Handle zoom icon click
    zoomIcon.addEventListener('click', function() {
        const currentImage = document.querySelector('.swiper-slide-active img');
        if (currentImage) {
            openModal(currentImage.src);
        }
    });
    
    // Make modal functions globally available
    window.portfolioZoom = {
        openModal: openModal,
        closeModal: closeModal
    };
})(); 