/**
 * Lightweight typing animation for hero section
 */
document.addEventListener('DOMContentLoaded', () => {
  const typingElement = document.getElementById('typing-text');
  if (!typingElement) return;

  const strings = [
    'Explore Your Curiosity',
    'Explore My Curiosity'
  ];

  let stringIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 150;

  // Find common prefix to avoid deleting everything
  const findCommonPrefix = (s1, s2) => {
    let i = 0;
    while (i < s1.length && i < s2.length && s1[i] === s2[i]) i++;
    return i;
  };

  function type() {
    const currentString = strings[stringIndex];
    const nextString = strings[(stringIndex + 1) % strings.length];
    const commonPrefixLen = findCommonPrefix(currentString, nextString);

    if (isDeleting) {
      typingElement.textContent = currentString.substring(0, charIndex--);
      typingSpeed = 75;
    } else {
      typingElement.textContent = currentString.substring(0, charIndex++);
      typingSpeed = 150;
    }

    // Finished typing the current string
    if (!isDeleting && charIndex === currentString.length + 1) {
      isDeleting = true;
      typingSpeed = 2000; // Wait at the end
    } 
    // Deleted back to the common prefix
    else if (isDeleting && charIndex === commonPrefixLen - 1) {
      isDeleting = false;
      stringIndex = (stringIndex + 1) % strings.length;
      charIndex = commonPrefixLen;
      typingSpeed = 500; // Pause before typing the next string's unique part
    }

    setTimeout(type, typingSpeed);
  }

  // Start the animation
  type();
});
