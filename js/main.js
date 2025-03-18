// בדיקת תאימות דפדפן
if (!('IntersectionObserver' in window)) {
    // פולי-פיל בסיסי ל-IntersectionObserver אם צריך
    const script = document.createElement('script');
    script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
    document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', function() {
    const totalPages = 19;
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    const thumbnailsContainer = document.querySelector('.thumbnails-container');
    const zoomModal = document.querySelector('.zoom-modal');
    const zoomModalContent = document.querySelector('.zoom-modal-content');
    const zoomImage = document.getElementById('zoom-image');
    const zoomClose = document.querySelector('.zoom-close');
    const zoomIcon = document.querySelector('.zoom-icon');
    const zoomIn = document.querySelector('.zoom-in');
    const zoomOut = document.querySelector('.zoom-out');
    const zoomReset = document.querySelector('.zoom-reset');
    
    // עדכון הטקסט של מספר הדפים הכולל
    document.getElementById('total-pages').textContent = totalPages;
    
    // טעינת התמונות הראשיות והמוקטנות
    for (let i = 1; i <= totalPages; i++) {
        const pageNum = i.toString().padStart(2, '0'); // הוספת אפס מובילי
        const imagePath = `assets/images/page-${pageNum}.jpg`;
        
        // הוספת תמונה לתצוגה הראשית
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `<img src="${imagePath}" alt="עמוד ${i}" loading="lazy" data-page="${i}">`;
        swiperWrapper.appendChild(slide);
        
        // הוספת תמונה מוקטנת
        const thumbnail = document.createElement('img');
        thumbnail.className = 'thumbnail';
        thumbnail.src = imagePath;
        thumbnail.alt = `תמונה מוקטנת ${i}`;
        thumbnail.dataset.index = i - 1;
        thumbnail.addEventListener('click', function() {
            swiper.slideTo(parseInt(this.dataset.index));
        });
        thumbnailsContainer.appendChild(thumbnail);
    }
    
    // אתחול Swiper עם אפקט מעודן
    const swiper = new Swiper('.swiper-container', {
        effect: 'creative',
        creativeEffect: {
            prev: {
                // הדף הקודם יזוז החוצה
                translate: ['-120%', 0, -500],
                opacity: 0,
            },
            next: {
                // הדף הבא יכנס מהצד
                translate: ['120%', 0, -500],
                opacity: 0,
            },
        },
        speed: 800,
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 1,
        keyboard: {
            enabled: true,
        },
        mousewheel: {
            invert: false,
            sensitivity: 0.8,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        on: {
            slideChange: function() {
                // עדכון מספר עמוד נוכחי
                document.getElementById('current-page').textContent = this.activeIndex + 1;
                
                // הוספת אנימציית דפדוף
                const activeSlide = document.querySelector('.swiper-slide-active');
                activeSlide.querySelector('img').classList.add('page-turning');
                
                // הסרת האנימציה אחרי שהיא מסתיימת
                setTimeout(() => {
                    activeSlide.querySelector('img').classList.remove('page-turning');
                }, 700);
                
                // עדכון התמונה המוקטנת הפעילה
                document.querySelectorAll('.thumbnail').forEach((thumb, idx) => {
                    if (idx === this.activeIndex) {
                        thumb.classList.add('active');
                        // גלילה אוטומטית לתמונה המוקטנת הפעילה
                        thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    } else {
                        thumb.classList.remove('active');
                    }
                });
            },
            init: function() {
                // סימון התמונה המוקטנת הראשונה כפעילה
                document.querySelector('.thumbnail').classList.add('active');
            }
        }
    });
    
    // מאזיני מקלדת לניווט
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            if (zoomModal.classList.contains('show')) {
                // כשהמודאל פתוח, לא לעשות כלום
                return;
            }
            
            if (e.key === 'ArrowLeft') {
                swiper.slideNext();
            } else if (e.key === 'ArrowRight') {
                swiper.slidePrev();
            }
        } else if (e.key === 'Escape' && zoomModal.classList.contains('show')) {
            closeZoomModal();
        }
    });
    
    // משתנים לשליטה בזום
    let scale = 1;
    
    // פונקציה לעדכון זום
    function applyZoom() {
        zoomImage.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
    
    // פונקציה לאיפוס הזום
    function resetZoom() {
        scale = 1;
        applyZoom();
    }
    
    // טיפול בכפתורי זום
    zoomIn.addEventListener('click', function() {
        scale += 0.2;
        if (scale > 5) scale = 5;
        applyZoom();
    });
    
    zoomOut.addEventListener('click', function() {
        scale -= 0.2;
        if (scale < 0.5) scale = 0.5;
        applyZoom();
    });
    
    zoomReset.addEventListener('click', resetZoom);
    
    // טיפול בגלגלת העכבר לזום
    zoomImage.addEventListener('wheel', function(e) {
        e.preventDefault();
        
        if (e.deltaY < 0) {
            // זום פנימה
            scale += 0.2;
            if (scale > 5) scale = 5;
        } else {
            // זום החוצה
            scale -= 0.2;
            if (scale < 0.5) scale = 0.5;
        }
        
        applyZoom();
    });
    
    // מניעת גלילה במודאל
    zoomModal.addEventListener('wheel', function(e) {
        e.preventDefault();
    });
    
    // פתיחת המודאל
    document.querySelectorAll('.swiper-slide img').forEach(function(img) {
        img.addEventListener('click', function() {
            zoomImage.src = this.src;
            zoomModal.style.display = 'block';
            resetZoom();
        });
    });
    
    // סגירת המודאל
    zoomClose.addEventListener('click', function() {
        zoomModal.style.display = 'none';
    });
    
    // תמיכה במכשירי מגע
    if (typeof Hammer !== 'undefined') {
        const hammertime = new Hammer(zoomImage);
        
        hammertime.get('pinch').set({ enable: true });
        hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        
        let lastScale = 1;
        
        hammertime.on('pinchstart', function() {
            startScale = currentScale || 1;
            lastScale = 1;
        });
        
        hammertime.on('pinch', function(e) {
            currentScale = Math.max(0.5, Math.min(startScale * e.scale / lastScale, 5));
            applyTransform();
        });
        
        hammertime.on('pinchend', function() {
            lastScale = 1;
        });
        
        hammertime.on('panstart', function() {
            if (currentScale > 1) {
                startX = currentX;
                startY = currentY;
            }
        });
        
        hammertime.on('pan', function(e) {
            if (currentScale > 1) {
                currentX = startX + e.deltaX;
                currentY = startY + e.deltaY;
                applyTransform();
            }
        });
        
        // כפול-לחיצה להגדלה מהירה
        hammertime.on('doubletap', function() {
            if (currentScale === 1) {
                currentScale = 2.5;
            } else {
                currentScale = 1;
                currentX = 0;
                currentY = 0;
            }
            applyTransform();
        });
    }
    
    // הוספת טעינה מקדימה של תמונות
    function preloadImages() {
        const nextIndex = swiper.activeIndex + 1;
        const prevIndex = swiper.activeIndex - 1;
        
        if (nextIndex < totalPages) {
            const nextPage = (nextIndex + 1).toString().padStart(2, '0');
            const img = new Image();
            img.src = `assets/images/page-${nextPage}.jpg`;
        }
        
        if (prevIndex >= 0) {
            const prevPage = (prevIndex + 1).toString().padStart(2, '0');
            const img = new Image();
            img.src = `assets/images/page-${prevPage}.jpg`;
        }
    }
    
    // הפעלת טעינה מקדימה בכל החלפת עמוד
    swiper.on('slideChange', preloadImages);
    
    // טעינה מקדימה ראשונית
    preloadImages();
    
    // אפקט תקריב בריחוף על תמונות
    const slideImages = document.querySelectorAll('.swiper-slide img');
    slideImages.forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
});

// תיקון בעיית תזוזת תמונות במובייל וטאבלטים
(function() {
  // בדיקה אם המכשיר הוא מובייל או טאבלט
  const isMobileOrTablet = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i.test(navigator.userAgent);
  
  if (isMobileOrTablet) {
    document.addEventListener('DOMContentLoaded', function() {
      const slides = document.querySelectorAll('.swiper-slide');
      
      slides.forEach(function(slide) {
        const img = slide.querySelector('img');
        if (!img) return;
        
        // מניעת פתיחת המודאל בלחיצה על תמונה במובייל
        img.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
        }, true);
        
        // הגדרת משתנים לזום
        let currentScale = 1;
        let startScale = 1;
        let lastTapTime = 0;
        
        // טיפול בתחילת מגע
        img.addEventListener('touchstart', function(e) {
          if (e.touches.length === 2) {
            e.preventDefault();
            startScale = currentScale;
          }
          
          // טיפול בדאבל טאפ
          const currentTime = new Date().getTime();
          const tapLength = currentTime - lastTapTime;
          if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();
            currentScale = currentScale === 1 ? 2 : 1;
            updateZoom();
          }
          lastTapTime = currentTime;
        });
        
        // טיפול בתנועת אצבעות
        img.addEventListener('touchmove', function(e) {
          if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            
            // חישוב המרחק בין האצבעות
            const distance = Math.hypot(
              touch2.clientX - touch1.clientX,
              touch2.clientY - touch1.clientY
            );
            
            // עדכון הסקייל בהתאם למרחק
            const newScale = Math.min(Math.max(startScale * (distance / initialDistance), 1), 3);
            if (newScale !== currentScale) {
              currentScale = newScale;
              updateZoom();
            }
          }
        });
        
        // פונקציה לעדכון הזום
        function updateZoom() {
          img.style.transform = `scale(${currentScale})`;
          slide.classList.toggle('zoomed', currentScale > 1);
          
          // עדכון מצב הסליידר
          const swiper = slide.closest('.swiper-container').swiper;
          if (swiper) {
            if (currentScale > 1) {
              swiper.allowTouchMove = false;
              swiper.allowSlideNext = false;
              swiper.allowSlidePrev = false;
            } else {
              swiper.allowTouchMove = true;
              swiper.allowSlideNext = true;
              swiper.allowSlidePrev = true;
            }
          }
        }
        
        // איפוס הזום בסיום המגע
        img.addEventListener('touchend', function() {
          if (currentScale < 1.1) {
            currentScale = 1;
            updateZoom();
          }
        });
      });
      
      // הסתרת אייקון הזום במובייל
      const zoomIcons = document.querySelectorAll('.zoom-icon');
      zoomIcons.forEach(icon => icon.style.display = 'none');
      
      // עדכון ה-viewport למובייל
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.content = "width=device-width, initial-scale=1.0, user-scalable=yes, maximum-scale=3.0";
      }
    });
  }
})();

// תמיכה רספונסיבית מקיפה לכל סוגי המכשירים
(function() {
  // פונקציה לזיהוי מכשירים ניידים וטאבלטים
  function isMobileOrTablet() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  }
  
  // פונקציה לזיהוי אייפון וספארי
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }
  
  // פונקציה לזיהוי אנדרואיד
  function isAndroid() {
    return /android/i.test(navigator.userAgent);
  }
  
  // התאמות למכשירים ניידים וטאבלטים
  if (isMobileOrTablet()) {
    document.addEventListener('DOMContentLoaded', function() {
      // הגדרות בסיסיות למובייל
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.content = "width=device-width, initial-scale=1.0, user-scalable=yes, maximum-scale=5.0, minimum-scale=1.0";
      }
      
      // טיפול בתמונות במובייל
      const slideImages = document.querySelectorAll('.swiper-slide img');
      slideImages.forEach(img => {
        let currentScale = 1;
        let startScale = 1;
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let initialDistance = 0;
        let isZooming = false;
        
        // מניעת גרירה של תמונות
        img.addEventListener('dragstart', (e) => e.preventDefault());
        
        // שיפור ביצועי טעינה
        if ('loading' in HTMLImageElement.prototype) {
          img.loading = 'lazy';
        }
        
        // פונקציה להחלת טרנספורם על התמונה
        function applyTransform() {
          const limitX = (img.width * currentScale - img.width) / 2;
          const limitY = (img.height * currentScale - img.height) / 2;
          
          // הגבלת הזזה לגבולות התמונה
          currentX = Math.min(Math.max(currentX, -limitX), limitX);
          currentY = Math.min(Math.max(currentY, -limitY), limitY);
          
          img.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
        }
        
        // איפוס זום
        function resetZoom() {
          currentScale = 1;
          currentX = 0;
          currentY = 0;
          isZooming = false;
          img.style.transform = 'none';
          document.body.classList.remove('zooming');
          img.closest('.swiper-slide').classList.remove('swiper-slide-zoomed');
        }
        
        // טיפול במחוות מגע
        img.addEventListener('touchstart', function(e) {
          if (e.touches.length === 2) {
            e.preventDefault();
            isZooming = true;
            startScale = currentScale;
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            initialDistance = Math.hypot(
              touch2.clientX - touch1.clientX,
              touch2.clientY - touch1.clientY
            );
            document.body.classList.add('zooming');
            img.closest('.swiper-slide').classList.add('swiper-slide-zoomed');
          } else if (e.touches.length === 1 && currentScale > 1) {
            e.preventDefault();
            const touch = e.touches[0];
            startX = touch.clientX - currentX;
            startY = touch.clientY - currentY;
          }
        }, { passive: false });
        
        img.addEventListener('touchmove', function(e) {
          if (e.touches.length === 2 && isZooming) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
              touch2.clientX - touch1.clientX,
              touch2.clientY - touch1.clientY
            );
            
            currentScale = Math.min(Math.max(startScale * (currentDistance / initialDistance), 1), 4);
            applyTransform();
          } else if (e.touches.length === 1 && currentScale > 1) {
            e.preventDefault();
            const touch = e.touches[0];
            currentX = touch.clientX - startX;
            currentY = touch.clientY - startY;
            applyTransform();
          }
        }, { passive: false });
        
        img.addEventListener('touchend', function(e) {
          if (e.touches.length === 0) {
            if (currentScale === 1) {
              resetZoom();
            }
            isZooming = false;
          }
        });
        
        // טיפול בלחיצה כפולה
        let lastTap = 0;
        img.addEventListener('touchend', function(e) {
          const currentTime = new Date().getTime();
          const tapLength = currentTime - lastTap;
          if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();
            if (currentScale === 1) {
              currentScale = 2;
              document.body.classList.add('zooming');
              img.closest('.swiper-slide').classList.add('swiper-slide-zoomed');
            } else {
              resetZoom();
            }
            applyTransform();
          }
          lastTap = currentTime;
        });
      });
      
      // התאמות ספציפיות למערכות הפעלה
      if (isIOS()) {
        document.head.insertAdjacentHTML('beforeend', `
          <style>
            .swiper-slide img {
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              touch-action: none;
            }
            .swiper-slide-zoomed img {
              touch-action: pan-x pan-y pinch-zoom;
            }
          </style>
        `);
      } else if (isAndroid()) {
        document.head.insertAdjacentHTML('beforeend', `
          <style>
            .swiper-slide img {
              touch-action: none;
            }
            .swiper-slide-zoomed img {
              touch-action: pan-x pan-y pinch-zoom;
            }
          </style>
        `);
      }
      
      // מניעת גלילה בזמן זום
      document.addEventListener('touchmove', function(e) {
        if (document.body.classList.contains('zooming')) {
          e.preventDefault();
        }
      }, { passive: false });
    });
  }
})(); 