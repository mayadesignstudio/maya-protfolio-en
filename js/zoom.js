// פונקציונליות משולבת לתמיכה בעכבר ובמסכי מגע
(function() {
    // משתנים משותפים
    let scale = 1;
    let posX = 0;
    let posY = 0;
    let isDragging = false;
    let startX, startY;
    
    // משתנים למסכי מגע
    let lastDistance = 0;
    
    const zoomImage = document.getElementById('zoom-image');
    const zoomModal = document.querySelector('.zoom-modal');
    const zoomClose = document.querySelector('.zoom-close');
    const zoomIn = document.querySelector('.zoom-in');
    const zoomOut = document.querySelector('.zoom-out');
    const zoomReset = document.querySelector('.zoom-reset');
    const zoomIcon = document.querySelector('.zoom-icon');
    
    // בדיקה אם המכשיר הוא נייד
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // פונקציה לעדכון התמונה
    function updateTransform() {
        zoomImage.style.transform = `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px)) scale(${scale})`;
    }
    
    // איפוס התמונה
    function resetZoom() {
        scale = 1;
        posX = 0;
        posY = 0;
        updateTransform();
    }
    
    // חישוב מרחק בין שתי נקודות מגע
    function getDistance(touch1, touch2) {
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) + 
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    }
    
    // Open modal function
    function openModal(imageSrc) {
        zoomModal.style.display = 'block';
        zoomImage.src = imageSrc;
        document.body.style.overflow = 'hidden';
        resetZoom();
    }

    // Close modal function
    function closeModal() {
        zoomModal.style.display = 'none';
        document.body.style.overflow = '';
        resetZoom();
    }
    
    // ===== טיפול באירועי עכבר (למחשב) =====
    
    // בדיקה אם המכשיר הוא נייד
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
        // מחיקת אירועי גלגלת קודמים
        const oldListeners = zoomImage.getEventListeners?.('wheel') || [];
        oldListeners.forEach(listener => {
            zoomImage.removeEventListener('wheel', listener.listener);
        });
        
        // התנהגות חדשה לגלגלת העכבר
        zoomImage.addEventListener('wheel', function(e) {
            e.preventDefault();
            
            // אם נלחץ Shift - עדיין מאפשר זום
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
            // אחרת, אם כבר בזום - מאפשר גלילה למעלה/למטה
            else if (scale > 1) {
                const scrollSpeed = 30 / scale; // מהירות גלילה מותאמת לזום
                posY += e.deltaY < 0 ? scrollSpeed : -scrollSpeed;
                
                // הגבלת הגלילה למסגרת התמונה
                const maxOffset = (scale - 1) * Math.min(zoomImage.width, zoomImage.height) / 2;
                posY = Math.min(Math.max(-maxOffset, posY), maxOffset);
            }
            // אם לא בזום ולא נלחץ Shift - עדיין מאפשר זום רגיל
            else {
                if (e.deltaY < 0) {
                    scale += 0.2;
                } else {
                    scale = 1;
                }
            }
            
            updateTransform();
        }, { passive: false });
        
        // הוספת טיפ שימוש
        const zoomModalContent = document.querySelector('.zoom-modal-content');
        const zoomTip = document.createElement('div');
        zoomTip.className = 'zoom-scroll-tip';
        zoomTip.innerText = 'גלגל עכבר: לגלילה | SHIFT+גלגל: לזום';
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
        
        // הצגת הטיפ למספר שניות בפתיחת המודאל
        zoomModal.addEventListener('click', function(e) {
            if (e.target === this || e.target.className === 'zoom-modal-content') {
                zoomTip.style.opacity = '1';
                setTimeout(() => {
                    zoomTip.style.opacity = '0';
                }, 3000);
            }
        });
    }
    
    // התחלת גרירה
    zoomImage.addEventListener('mousedown', function(e) {
        if (scale > 1) {
            isDragging = true;
            startX = e.clientX - posX;
            startY = e.clientY - posY;
            e.preventDefault();
        }
    });
    
    // גרירת התמונה
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            posX = e.clientX - startX;
            posY = e.clientY - startY;
            updateTransform();
        }
    });
    
    // סיום גרירה
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
    
    // ===== טיפול באירועי מגע (לניידים) =====
    if (isTouchDevice) {
        // התחלת מגע
        zoomImage.addEventListener('touchstart', function(e) {
            if (e.touches.length === 2) {
                // שתי אצבעות - לזום
                lastDistance = getDistance(e.touches[0], e.touches[1]);
                e.preventDefault();
            } else if (e.touches.length === 1 && scale > 1) {
                // אצבע אחת להזזה (אחרי הזום)
                startX = e.touches[0].clientX - posX;
                startY = e.touches[0].clientY - posY;
            }
        });
        
        // תנועת מגע
        zoomImage.addEventListener('touchmove', function(e) {
            if (e.touches.length === 2) {
                // זום עם שתי אצבעות
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
                // הזזה עם אצבע אחת
                posX = e.touches[0].clientX - startX;
                posY = e.touches[0].clientY - startY;
                
                updateTransform();
            }
        }, { passive: false });
        
        // סיום מגע
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
    
    // ===== כפתורים משותפים =====
    
    // כפתור הגדלה
    zoomIn.addEventListener('click', function() {
        scale = Math.min(5, scale + 0.2);
        updateTransform();
    });
    
    // כפתור הקטנה
    zoomOut.addEventListener('click', function() {
        scale = Math.max(0.5, scale - 0.2);
        if (scale <= 1) {
            posX = 0;
            posY = 0;
        }
        updateTransform();
    });
    
    // כפתור איפוס
    zoomReset.addEventListener('click', resetZoom);
    
    // סגירת המודאל
    zoomClose.addEventListener('click', closeModal);
    
    // סגירת המודאל בלחיצה מחוץ לתמונה
    zoomModal.addEventListener('click', function(e) {
        if (e.target === zoomModal) {
            closeModal();
        }
    });
    
    // מניעת גלילת התוכן במודאל כאשר התמונה מוגדלת
    zoomModal.addEventListener('wheel', function(e) {
        if (scale > 1) {
            e.preventDefault();
        }
    });
    
    // טיפול בלחיצה על אייקון הזום
    zoomIcon.addEventListener('click', function() {
        const currentImage = document.querySelector('.swiper-slide-active img');
        if (currentImage) {
            openModal(currentImage.src);
        }
    });
    
    // הפיכת פונקציות המודאל לזמינות גלובלית
    window.portfolioZoom = {
        openModal: openModal,
        closeModal: closeModal
    };
})(); 