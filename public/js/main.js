// Main JavaScript for homepage functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth animations to buttons
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add dynamic background animation
    const blobs = document.querySelectorAll('.blob');
    
    function animateBlobs() {
        blobs.forEach((blob, index) => {
            const delay = index * 2000;
            const duration = 8000 + Math.random() * 4000;
            
            setInterval(() => {
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                const scale = 0.8 + Math.random() * 0.4;
                
                blob.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
            }, duration);
        });
    }
    
    animateBlobs();
});