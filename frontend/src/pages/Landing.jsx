import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, ShoppingBag, Leaf, ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';

// Particle canvas background representing floating sparks and pollen drift
const CanvasBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = 35;

    // Mouse coordinates
    let mouse = { x: -1000, y: -1000, active: false };

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 4 + 1.5;
        this.speedX = Math.random() * 0.3 - 0.15;
        this.speedY = Math.random() * -0.4 - 0.1; // slow float upwards
        
        // Sage green, soft honey, warm clay colors
        const colors = [
          'rgba(45, 90, 39, 0.09)',
          'rgba(76, 138, 69, 0.08)',
          'rgba(244, 162, 97, 0.07)',
          'rgba(224, 122, 95, 0.07)'
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.y < -10) {
          this.y = height + 10;
          this.x = Math.random() * width;
        }
        if (this.x < -10 || this.x > width + 10) {
          this.reset();
        }

        // Mouse tracking
        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const distance = Math.hypot(dx, dy);
          const maxDistance = 160;
          if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 1.5;
            this.y += Math.sin(angle) * force * 1.5;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="canvas-bg" />;
};

const Landing = () => {
  const navigate = useNavigate();
  const visualRef = useRef(null);

  // Live farm listings simulation ticker data
  const feedItems = [
    { text: '🥦 Oakwood Organic Farm harvested 12kg Fresh Broccoli', location: '1.2 mi' },
    { text: '🍎 Honeycrisp Apples listed by Valley Orchards', location: '3.4 mi' },
    { text: '🏡 Sarah purchased fresh Honeyberries from John\'s Farm', location: 'Direct Match' },
    { text: '🥕 15 packs of Baby Carrots added by Green Gardeners', location: '0.8 mi' },
    { text: '🍯 Sweet Hill Apiary listed raw Honeycomb jars', location: '2.1 mi' },
    { text: '🥛 Meadow Dairy added Raw Goat Milk bottles', location: '4.0 mi' },
    { text: '🍓 David ordered 3kg Fresh Picked Strawberries', location: 'Direct Match' }
  ];

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Stagger reveal of badges, texts and timeline cards
    tl.fromTo(
      '.ticker-container',
      { opacity: 0, y: -15 },
      { opacity: 1, y: 0, duration: 0.6 }
    );

    tl.fromTo(
      '.landing-badge',
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.3'
    );

    tl.fromTo(
      '.landing-title span',
      { opacity: 0, y: 35, rotateX: -8 },
      { opacity: 1, y: 0, rotateX: 0, duration: 0.85, stagger: 0.12 },
      '-=0.4'
    );

    tl.fromTo(
      '.landing-subtitle',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.65 },
      '-=0.5'
    );

    tl.fromTo(
      '.gateway-card',
      { opacity: 0, scale: 0.95, y: 15 },
      { opacity: 1, scale: 1, y: 0, duration: 0.65, stagger: 0.15 },
      '-=0.4'
    );

    tl.fromTo(
      '.stat-item',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
      '-=0.3'
    );

    tl.fromTo(
      visualRef.current,
      { opacity: 0, scale: 0.96, x: 20 },
      { opacity: 1, scale: 1, x: 0, duration: 0.8 },
      '-=0.85'
    );

    tl.fromTo(
      '.portal-card',
      { opacity: 0, y: 35 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 },
      '-=0.5'
    );

    tl.fromTo(
      '.timeline-step',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.18 },
      '-=0.45'
    );
  }, []);

  const handleMouseMoveVisual = (e) => {
    const container = visualRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Elegant tilt
    container.style.transform = `perspective(800px) rotateY(${x * 0.03}deg) rotateX(${-y * 0.03}deg) translateY(-4px)`;
  };

  const handleMouseLeaveVisual = () => {
    const container = visualRef.current;
    if (!container) return;
    container.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0px)';
  };

  return (
    <div className="landing-container">
      <CanvasBackground />

      {/* Simulated Live Ticker Feed */}
      <div className="ticker-container">
        <div className="ticker-wrapper">
          {/* Double list to ensure smooth continuous scroll */}
          {[...feedItems, ...feedItems].map((item, idx) => (
            <span className="ticker-item" key={idx}>
              <span className="ticker-dot"></span>
              {item.text} 
              <span style={{ fontSize: '0.75rem', opacity: 0.6, background: 'rgba(45, 90, 39, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '6px' }}>
                {item.location}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-layout">
        <div className="hero-content">
          <span className="landing-badge">
            <Leaf size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> 
            Pure Direct Connection
          </span>
          <h1 className="landing-title">
            <span>Skip the Middleman.</span>
            <span>Taste Peak Freshness.</span>
          </h1>
          <p className="landing-subtitle">
            An organic bridge matching local growers directly with conscious community buyers. Get your vegetables, fruits, and honey harvested fresh, at prices that support the soil.
          </p>
          
          <div className="gateway-cards">
            {/* Consumer Gateway Card */}
            <div className="gateway-card consumer-gw" onClick={() => navigate('/consumer')}>
              <div className="gateway-header">
                <div className="gateway-icon">
                  <ShoppingBag size={20} />
                </div>
                <h3>I am a Consumer</h3>
              </div>
              <p>Browse local listings, buy organic goods directly, and support nearby farms.</p>
              <div className="gateway-btn-label">
                Shop Marketplace <ArrowRight size={14} />
              </div>
            </div>

            {/* Farmer Gateway Card */}
            <div className="gateway-card farmer-gw" onClick={() => navigate('/farmer')}>
              <div className="gateway-header">
                <div className="gateway-icon">
                  <Sprout size={20} />
                </div>
                <h3>I am a Farmer</h3>
              </div>
              <p>List your harvested crops, manage real-time stock levels, and set your own prices.</p>
              <div className="gateway-btn-label">
                Farmer Dashboard <ArrowRight size={14} />
              </div>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num">100%</span>
              <span className="stat-lbl">To the Farmers</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">&lt; 24h</span>
              <span className="stat-lbl">Harvest-to-Table</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">0 mi</span>
              <span className="stat-lbl">Warehouse Transit</span>
            </div>
          </div>
        </div>

        {/* Animated Connection SVG Illustration Panel */}
        <div 
          className="hero-visual clay-card"
          ref={visualRef}
          onMouseMove={handleMouseMoveVisual}
          onMouseLeave={handleMouseLeaveVisual}
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          {/* Pulsing connection line */}
          <svg className="connection-path-svg" viewBox="0 0 400 400">
            <path
              d="M 90,130 Q 200,20 200,200 T 310,270"
              fill="none"
              stroke="rgba(45, 90, 39, 0.1)"
              strokeWidth="4"
            />
            <path
              className="path-dash"
              d="M 90,130 Q 200,20 200,200 T 310,270"
              fill="none"
              stroke="var(--primary-light)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle className="pulsing-dot" cx="90" cy="130" r="5" fill="var(--primary)" />
            <circle className="pulsing-dot" cx="310" cy="270" r="5" fill="var(--accent)" />
          </svg>

          {/* Farmer Node */}
          <div className="floating-card c1" style={{ top: '15%', left: '8%', zIndex: 3 }}>
            <div className="icon-circle">
              <Sprout size={16} />
            </div>
            <div className="floating-card-info">
              <h5>Local Farm</h5>
              <p>Fresh listings loaded</p>
            </div>
          </div>

          {/* Direct Matching Delivery indicator */}
          <div 
            className="floating-card" 
            style={{ 
              top: '44%', 
              left: '26%', 
              zIndex: 3, 
              background: 'rgba(255, 255, 255, 0.95)',
              animation: 'float 5s ease-in-out infinite 1s' 
            }}
          >
            <div className="icon-circle" style={{ background: 'var(--gold)' }}>
              <Leaf size={16} />
            </div>
            <div className="floating-card-info">
              <h5>Direct Track</h5>
              <p>No storage warehouses</p>
            </div>
          </div>

          {/* Consumer Node */}
          <div className="floating-card c2" style={{ bottom: '18%', right: '8%', zIndex: 3 }}>
            <div className="icon-circle">
              <ShoppingBag size={16} />
            </div>
            <div className="floating-card-info">
              <h5>Your Table</h5>
              <p>Direct consumer order</p>
            </div>
          </div>
        </div>
      </div>

      {/* Soil-to-Table Timeline visualization */}
      <div className="timeline-container">
        <h2 className="timeline-title">The Soil-to-Table Connection</h2>
        <p className="timeline-subtitle">Experience transparent food cycles. Here is how direct farm-to-consumer trading operates:</p>
        
        <div className="timeline-grid">
          {/* Step 1 */}
          <div className="timeline-step">
            <span className="timeline-badge-num">1</span>
            <div className="timeline-icon-circle">
              <Sprout size={28} />
            </div>
            <h4>Harvested & Listed</h4>
            <p>Farmers list items directly on the app database, set their own prices, and harvest only when orders are locked.</p>
          </div>

          {/* Step 2 */}
          <div className="timeline-step alt">
            <span className="timeline-badge-num">2</span>
            <div className="timeline-icon-circle">
              <Leaf size={28} />
            </div>
            <h4>Direct Match Shop</h4>
            <p>You browse regional items, add them to your cart, and purchase. 100% of the sale value is routed to the farm.</p>
          </div>

          {/* Step 3 */}
          <div className="timeline-step">
            <span className="timeline-badge-num">3</span>
            <div className="timeline-icon-circle">
              <HeartHandshake size={28} />
            </div>
            <h4>Peak Fresh Delivery</h4>
            <p>Produce bypasses distribution centres and cold-storage chambers, arriving at your doorstep inside 24 hours.</p>
          </div>
        </div>
      </div>

      {/* Access Portals */}
      <div className="portal-section" style={{ marginTop: '5rem' }}>
        <div className="portal-grid">
          {/* Farmer Card */}
          <div className="portal-card farmer-card" onClick={() => navigate('/farmer')}>
            <div className="portal-icon-wrapper">
              <Sprout size={38} />
            </div>
            <h3>Farmer Portal</h3>
            <p>
              List your fresh harvest, manage live inventory amounts, establish prices directly, and coordinate regional customer orders.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }}>
              Manage Harvests
            </button>
          </div>

          {/* Consumer Card */}
          <div className="portal-card consumer-card" onClick={() => navigate('/consumer')}>
            <div className="portal-icon-wrapper">
              <ShoppingBag size={38} />
            </div>
            <h3>Consumer Market</h3>
            <p>
              Browse community listings, add goods to your cart, inspect individual grower profiles, and buy raw farm products.
            </p>
            <button className="btn btn-secondary" style={{ width: '100%' }}>
              Browse Listings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
