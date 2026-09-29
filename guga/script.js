/**
 * ==============================================================================
 * Nova — Next-Generation Web Platform
 * Interactive Script (script.js)
 * High-performance, accessible, vanilla JavaScript micro-interactions & logic
 * ==============================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all interactive modules
  ThemeModule.init();
  NavbarModule.init();
  MobileNavModule.init();
  ScrollSpyModule.init();
  CounterModule.init();
  ScrollRevealModule.init();
  CardTiltModule.init();
  DashboardSimulationModule.init();
  CodeSnippetModule.init();
  ContactFormModule.init();
  ToastModule.init();
  AmbientParallaxModule.init();
});

/**
 * ------------------------------------------------------------------------------
 * 1. THEME MODULE (Dark / Light Theme Switcher with LocalStorage & OS Sync)
 * ------------------------------------------------------------------------------
 */
const ThemeModule = (() => {
  const STORAGE_KEY = 'nova_theme_preference';
  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');

  const getSystemTheme = () => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  };

  const applyTheme = (theme, persist = true) => {
    root.setAttribute('data-theme', theme);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (err) {
        // Storage might be restricted; fail silently
      }
    }

    if (toggleBtn) {
      const isLight = theme === 'light';
      toggleBtn.setAttribute(
        'aria-label',
        isLight ? 'Switch to dark theme' : 'Switch to light theme'
      );
      toggleBtn.setAttribute(
        'title',
        isLight ? 'Switch to dark theme' : 'Switch to light theme'
      );
    }
  };

  const toggleTheme = () => {
    const currentTheme = root.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);

    // Provide subtle feedback
    ToastModule.show(
      newTheme === 'light' ? '☀️ Switched to Light Mode' : '🌙 Switched to Dark Mode',
      2200
    );
  };

  const init = () => {
    let savedTheme = null;
    try {
      savedTheme = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      savedTheme = null;
    }

    // Apply saved theme or system theme
    const initialTheme = savedTheme || getSystemTheme();
    applyTheme(initialTheme, false);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTheme);
    }

    // Listen for OS theme changes if user hasn't explicitly set a preference
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      mediaQuery.addEventListener('change', (e) => {
        let hasStored = false;
        try {
          hasStored = Boolean(localStorage.getItem(STORAGE_KEY));
        } catch (err) {
          hasStored = false;
        }

        if (!hasStored) {
          applyTheme(e.matches ? 'light' : 'dark', false);
        }
      });
    }
  };

  return { init, applyTheme };
})();

/**
 * ------------------------------------------------------------------------------
 * 2. NAVBAR & SCROLL PROGRESS MODULE
 * Sticky navbar glassmorphism, scroll progress bar, back-to-top button
 * ------------------------------------------------------------------------------
 */
const NavbarModule = (() => {
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scroll-progress');
  const backToTopBtn = document.getElementById('back-to-top');

  let isTicking = false;

  const updateScrollState = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    // 1. Sticky / Scrolled Navbar
    if (navbar) {
      if (scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // 2. Reading / Scroll Progress Bar
    if (scrollProgress && scrollHeight > 0) {
      const percentage = Math.min(100, Math.max(0, (scrollY / scrollHeight) * 100));
      scrollProgress.style.width = `${percentage}%`;
    }

    // 3. Back to Top Button Visibility
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    isTicking = false;
  };

  const onScroll = () => {
    if (!isTicking) {
      window.requestAnimationFrame(updateScrollState);
      isTicking = true;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const init = () => {
    window.addEventListener('scroll', onScroll, { passive: true });
    updateScrollState();

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', scrollToTop);
    }
  };

  return { init };
})();

/**
 * ------------------------------------------------------------------------------
 * 3. MOBILE NAVIGATION MODULE (Hamburger Menu Drawer)
 * Handles open/close, overlay dismiss, escape key, focus trapping
 * ------------------------------------------------------------------------------
 */
const MobileNavModule = (() => {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  const openMenu = () => {
    if (!menuToggle || !navMenu) return;
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    navMenu.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeMenu = () => {
    if (!menuToggle || !navMenu) return;
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  };

  const toggleMenu = () => {
    const isOpen = navMenu && navMenu.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const init = () => {
    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close when clicking any nav link
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('open')) {
          closeMenu();
        }
      });
    });

    // Close when clicking outside navbar/menu on mobile
    document.addEventListener('click', (e) => {
      if (
        navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        closeMenu();
      }
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        closeMenu();
        menuToggle.focus();
      }
    });

    // Reset overflow when viewport is resized beyond tablet breakpoint
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navMenu.classList.contains('open')) {
        closeMenu();
      }
    });
  };

  return { init, closeMenu };
})();

/**
 * ------------------------------------------------------------------------------
 * 4. SCROLLSPY & SMOOTH SCROLL MODULE
 * Highlights active navigation link based on current section viewport
 * Offset smooth scroll calculation for fixed navbar
 * ------------------------------------------------------------------------------
 */
const ScrollSpyModule = (() => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const navbar = document.getElementById('navbar');

  const highlightNav = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const navHeight = (navbar ? navbar.offsetHeight : 70) + 40;

    let currentSectionId = '';

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - navHeight;
      const sectionHeight = section.offsetHeight;

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    // Default to first section if at very top
    if (scrollY < 100 && sections.length > 0) {
      currentSectionId = sections[0].getAttribute('id');
    }

    if (currentSectionId) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }
  };

  const initSmoothLinks = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const navHeight = navbar ? navbar.offsetHeight : 70;
          const targetPosition =
            targetEl.getBoundingClientRect().top + window.pageYOffset - (navHeight + 10);

          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: 'smooth'
          });

          // Update URL hash smoothly without jump
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        }
      });
    });
  };

  const init = () => {
    window.addEventListener('scroll', highlightNav, { passive: true });
    initSmoothLinks();
    highlightNav();
  };

  return { init };
})();

/**
 * ------------------------------------------------------------------------------
 * 5. COUNTER ANIMATION MODULE (Hero Stats Number Count-Up)
 * Animated counting with cubic ease-out easing when entering viewport
 * ------------------------------------------------------------------------------
 */
const CounterModule = (() => {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  const easeOutExpo = (t) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  const animateCounter = (el) => {
    const rawTarget = el.getAttribute('data-target');
    const target = parseFloat(rawTarget);
    if (isNaN(target)) return;

    const isDecimal = rawTarget.includes('.');
    const decimalPlaces = isDecimal ? rawTarget.split('.')[1].length : 0;
    const duration = 2000; // ms
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentVal = easedProgress * target;

      el.textContent = isDecimal
        ? currentVal.toFixed(decimalPlaces)
        : Math.floor(currentVal).toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        el.textContent = rawTarget;
      }
    };

    requestAnimationFrame(updateCount);
  };

  const init = () => {
    if (!statNumbers.length) return;

    // Use IntersectionObserver so the animation plays once visible
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      statNumbers.forEach((el) => observer.observe(el));
    } else {
      // Fallback: immediately trigger
      statNumbers.forEach((el) => animateCounter(el));
    }
  };

  return { init };
})();

/**
 * ------------------------------------------------------------------------------
 * 6. SCROLL REVEAL MODULE
 * Automatically detects sections, titles, and cards to apply smooth entrance
 * ------------------------------------------------------------------------------
 */
const ScrollRevealModule = (() => {
  const init = () => {
    // Collect primary content elements to animate
    const elementsToReveal = document.querySelectorAll(`
      .section-badge-wrapper,
      .section-title,
      .section-subtitle,
      .about-content-card,
      .about-visual-card,
      .feature-card,
      .contact-info-panel,
      .contact-form-container
    `);

    elementsToReveal.forEach((el) => {
      el.classList.add('reveal');
    });

    // Stagger feature card entrance delays
    const featureCards = document.querySelectorAll('.features-grid .feature-card');
    featureCards.forEach((card, index) => {
      card.classList.add(`delay-${(index % 3) + 1}`);
    });

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('active');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -40px 0px'
        }
      );

      document.querySelectorAll('.reveal').forEach((el) => {
        revealObserver.observe(el);
      });
    } else {
      // Fallback for older browsers
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('active'));
    }
  };

  return { init };
})();

/**
 * ------------------------------------------------------------------------------
 * 7. 3D CARD TILT & SPOTLIGHT GLOW MODULE
 * High-performance 3D perspective tilt and interactive lighting on feature cards
 * ------------------------------------------------------------------------------
 */
const CardTiltModule = (() => {
  const cards = document.querySelectorAll('.tilt-card');

  const init = () => {
    // Only enable on devices with fine pointer (mouse), disable on touchscreens
    const hasFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer || !cards.length) return;

    cards.forEach((card) => {
      const glow = card.querySelector('.feature-card-glow');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -7; // degrees
        const rotateY = ((x - centerX) / centerX) * 7;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`;

        // Update spotlight position
        if (glow) {
          const pctX = (x / rect.width) * 100;
          const pctY = (y / rect.height) * 100;
          glow.style.background = `radial-gradient(circle at ${pctX.toFixed(1)}% ${pctY.toFixed(1)}%, rgba(139, 92, 246, 0.28) 0%, rgba(99, 102, 241, 0.08) 45%, transparent 70%)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';

        if (glow) {
          glow.style.background = '';
        }
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.15s ease-out';
      });
    });
  };

  return { init };
})();

/**
 * ------------------------------------------------------------------------------
 * 8. LIVE HERO DASHBOARD SIMULATION MODULE
 * Real-time dynamic updates for metrics & chart bars to create a living product feel
 * ------------------------------------------------------------------------------
 */
const DashboardSimulationModule = (() => {
  const chartBars = document.querySelectorAll('.preview-chart-sim .chart-bar');
  const metricLatency = document.querySelector('.metric-val.text-cyan');
  const metricPerf = document.querySelector('.metric-val.text-success');

  let simInterval = null;

  const simulateTick = () => {
    // Skip updates if user tab is inactive
    if (document.hidden) return;

    // 1. Randomize chart bars subtly
    if (chartBars.length) {
      const activeIdx = Math.floor(Math.random() * chartBars.length);
      chartBars.forEach((bar, idx) => {
        bar.classList.toggle('active-bar', idx === activeIdx);
        // Vary height within healthy range (35% to 98%)
        const randomHeight = Math.floor(Math.random() * 55) + 40;
        bar.style.setProperty('--h', `${randomHeight}%`);
      });
    }

    // 2. Realistic latency fluctuation (14ms - 22ms)
    if (metricLatency) {
      const ping = Math.floor(Math.random() * 8) + 14;
      metricLatency.textContent = `${ping}ms`;
    }

    // 3. Performance metric (98.2% - 99.8%)
    if (metricPerf) {
      const perf = (98 + Math.random() * 1.8).toFixed(1);
      metricPerf.textContent = `${perf}%`;
    }
  };

  const init = () => {
    if (!chartBars.length && !metricLatency && !metricPerf) return;

    // Run dynamic pulse every 3.8 seconds
    simInterval = setInterval(simulateTick, 3800);
  };

  return { init };
})();

/**
 * ------------------------------------------------------------------------------
 * 9. CODE BLOCK COPY MODULE
 * Adds an interactive one-click copy button with animated feedback
 * ------------------------------------------------------------------------------
 */
const CodeSnippetModule = (() => {
  const codeBlock = document.querySelector('.code-preview-block');

  const init = () => {
    if (!codeBlock) return;

    // Inject copy button into code block header
    const copyBtn = document.createElement('button');
    copyBtn.className = 'icon-btn code-copy-btn';
    copyBtn.setAttribute('type', 'button');
    copyBtn.setAttribute('aria-label', 'Copy code snippet to clipboard');
    copyBtn.setAttribute('title', 'Copy code');
    copyBtn.style.position = 'absolute';
    copyBtn.style.top = '10px';
    copyBtn.style.right = '10px';
    copyBtn.style.width = '32px';
    copyBtn.style.height = '32px';
    copyBtn.style.fontSize = '12px';
    copyBtn.style.zIndex = '5';
    copyBtn.style.background = 'rgba(255, 255, 255, 0.08)';

    copyBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    `;

    codeBlock.style.position = 'relative';
    codeBlock.appendChild(copyBtn);

    copyBtn.addEventListener('click', async () => {
      const codeText = Array.from(codeBlock.querySelectorAll('.code-line'))
        .map((line) => line.textContent.trim())
        .join('\n');

      try {
        await navigator.clipboard.writeText(codeText);
        copyBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
        copyBtn.style.borderColor = '#10b981';
        ToastModule.show('📋 Code copied to clipboard!', 2000);

        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          `;
          copyBtn.style.borderColor = '';
        }, 2200);
      } catch (err) {
        ToastModule.show('Unable to copy automatically', 2000);
      }
    });
  };

  return { init };
})();

/**
 * ------------------------------------------------------------------------------
 * 10. CONTACT FORM MODULE
 * Real-time field validation, error management, async submit simulation, success state
 * ------------------------------------------------------------------------------
 */
const ContactFormModule = (() => {
  const form = document.getElementById('contact-form');
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');
  const submitBtn = document.getElementById('submit-btn');
  const successBanner = document.getElementById('form-success');

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const validateField = (input, isValid, errorElementId, customErrorMsg) => {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return isValid;

    const errorEl = errorElementId ? document.getElementById(errorElementId) : null;
    if (errorEl && customErrorMsg) {
      errorEl.textContent = customErrorMsg;
    }

    if (!isValid) {
      formGroup.classList.add('has-error');
      input.setAttribute('aria-invalid', 'true');
    } else {
      formGroup.classList.remove('has-error');
      input.removeAttribute('aria-invalid');
    }

    return isValid;
  };

  const validateName = () => {
    if (!nameInput) return true;
    const value = nameInput.value.trim();
    const isValid = value.length >= 2;
    return validateField(
      nameInput,
      isValid,
      'name-error',
      value.length === 0 ? 'Full name is required' : 'Name must be at least 2 characters'
    );
  };

  const validateEmail = () => {
    if (!emailInput) return true;
    const value = emailInput.value.trim();
    const isValid = EMAIL_REGEX.test(value);
    return validateField(
      emailInput,
      isValid,
      'email-error',
      value.length === 0 ? 'Email address is required' : 'Please enter a valid email address'
    );
  };

  const validateMessage = () => {
    if (!messageInput) return true;
    const value = messageInput.value.trim();
    const isValid = value.length >= 10;
    return validateField(
      messageInput,
      isValid,
      'message-error',
      value.length === 0
        ? 'Message is required'
        : 'Please enter a message (at least 10 characters)'
    );
  };

  const setupLiveValidation = () => {
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        if (nameInput.closest('.form-group').classList.contains('has-error')) {
          validateName();
        }
      });
      nameInput.addEventListener('blur', validateName);
    }

    if (emailInput) {
      emailInput.addEventListener('input', () => {
        if (emailInput.closest('.form-group').classList.contains('has-error')) {
          validateEmail();
        }
      });
      emailInput.addEventListener('blur', validateEmail);
    }

    if (messageInput) {
      messageInput.addEventListener('input', () => {
        if (messageInput.closest('.form-group').classList.contains('has-error')) {
          validateMessage();
        }
      });
      messageInput.addEventListener('blur', validateMessage);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();

    if (!isNameValid || !isEmailValid || !isMessageValid) {
      // Focus on the first invalid field
      const firstInvalid = form.querySelector('.has-error input, .has-error textarea');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      ToastModule.show('⚠️ Please complete all required fields correctly', 2800);
      return;
    }

    // Set loading state on submit button
    if (submitBtn) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    }

    // Hide any previous success banner
    if (successBanner) {
      successBanner.classList.remove('active');
    }

    // Simulate async server request
    setTimeout(() => {
      if (submitBtn) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }

      // Show success notification
      if (successBanner) {
        successBanner.classList.add('active');
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      ToastModule.show('✨ Message sent successfully! Thank you.', 4000);

      // Reset form fields
      form.reset();

      // Remove any leftover validation classes
      form.querySelectorAll('.form-group').forEach((group) => {
        group.classList.remove('has-error');
      });
    }, 1100);
  };

  const init = () => {
    if (!form) return;
    setupLiveValidation();
    form.addEventListener('submit', handleSubmit);
  };

  return { init };
})();

/**
 * ------------------------------------------------------------------------------
 * 11. TOAST NOTIFICATION MODULE
 * Floating accessible snackbar alerts for user feedback
 * ------------------------------------------------------------------------------
 */
const ToastModule = (() => {
  let toastEl = null;
  let hideTimeout = null;

  const createToastElement = () => {
    let existing = document.getElementById('nova-toast');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'nova-toast';
      existing.className = 'nova-toast';
      existing.setAttribute('role', 'status');
      existing.setAttribute('aria-live', 'polite');
      document.body.appendChild(existing);
    }
    return existing;
  };

  const show = (message, duration = 3000) => {
    if (!toastEl) {
      toastEl = createToastElement();
    }

    toastEl.textContent = message;
    toastEl.classList.add('show');

    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }

    hideTimeout = setTimeout(() => {
      toastEl.classList.remove('show');
    }, duration);
  };

  const init = () => {
    toastEl = createToastElement();
  };

  return { init, show };
})();

/**
 * ------------------------------------------------------------------------------
 * 12. AMBIENT PARALLAX GLOW MODULE
 * Subtle mouse-following parallax on the ambient light orbs for depth
 * ------------------------------------------------------------------------------
 */
const AmbientParallaxModule = (() => {
  const glow1 = document.querySelector('.glow-1');
  const glow2 = document.querySelector('.glow-2');

  const init = () => {
    const hasFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer || (!glow1 && !glow2)) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    window.addEventListener(
      'mousemove',
      (e) => {
        const normX = e.clientX / window.innerWidth - 0.5;
        const normY = e.clientY / window.innerHeight - 0.5;
        targetX = normX * 45; // max 45px offset
        targetY = normY * 45;
      },
      { passive: true }
    );

    const render = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      if (glow1) {
        glow1.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0)`;
      }
      if (glow2) {
        glow2.style.transform = `translate3d(${(-currentX).toFixed(1)}px, ${(-currentY).toFixed(1)}px, 0)`;
      }

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  };

  return { init };
})();
