function addInternalNames() {
    // Handle both types of property elements
    const sidebarProperties = document.querySelectorAll('span[data-test-id]');
    const allPropertiesView = document.querySelectorAll('[data-profile-property]');
    
    // Handle sidebar properties
    sidebarProperties.forEach(propertyElement => {
        const internalName = propertyElement.getAttribute('data-test-id');
        const labelElement = propertyElement.querySelector('.private-form__label--floating .private-truncated-string__inner span');
        
        if (labelElement && !labelElement.querySelector('.internal-property-code')) {
            addInternalNameToLabel(labelElement, internalName);
        }
    });
    
    // Handle all properties view
    allPropertiesView.forEach(propertyElement => {
        const internalName = propertyElement.getAttribute('data-profile-property');
        const labelElement = propertyElement.querySelector('.private-form__label .private-truncated-string__inner span');
        
        if (labelElement && !labelElement.querySelector('.internal-property-code')) {
            addInternalNameToLabel(labelElement, internalName);
        }
    });
}

function addInternalNameToLabel(labelElement, internalName) {
    const container = document.createElement('span');
    container.className = 'internal-property-container';
    
    const codeElement = document.createElement('span');
    codeElement.className = 'internal-property-code';
    codeElement.setAttribute('role', 'button');
    codeElement.setAttribute('tabindex', '0');
    codeElement.textContent = `(${internalName})`;
    
    const linkElement = document.createElement('a');
    linkElement.className = 'internal-property-link';
    linkElement.innerHTML = '⚙️';
    linkElement.setAttribute('title', 'Edit property');
    
    const pathParts = window.location.pathname.split('/');
    const portalId = pathParts[2];
    const objectTypeMatch = window.location.pathname.match(/\/(\d+-\d+)\//);
    const objectType = objectTypeMatch ? objectTypeMatch[1] : '0-1';
    
    linkElement.href = `https://app.hubspot.com/property-settings/${portalId}/properties?type=${objectType}&action=edit&property=${internalName}`;
    linkElement.target = '_blank';
    
    const tooltip = document.createElement('span');
    tooltip.className = 'internal-property-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.textContent = 'Click to copy';
    
    container.appendChild(codeElement);
    container.appendChild(linkElement);
    container.appendChild(tooltip);
    
    labelElement.appendChild(container);
    
    codeElement.addEventListener('click', async (event) => {
        event.stopPropagation();
        try {
            await navigator.clipboard.writeText(internalName);
            tooltip.textContent = 'Copied!';
            tooltip.classList.add('copied');
            setTimeout(() => {
                tooltip.textContent = 'Click to copy';
                tooltip.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });

    codeElement.addEventListener('dblclick', (event) => {
        event.stopPropagation();
        window.open(linkElement.href, '_blank');
    });
}

// Initial call
addInternalNames();

// Set up observer
const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
            addInternalNames();
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });