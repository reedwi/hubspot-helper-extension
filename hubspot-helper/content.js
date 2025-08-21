function addInternalNames() {
    console.log('HubSpot Helper: Starting to add internal names...');
    
    // Performance optimization: Cache DOM queries and use more efficient selectors
    const startTime = performance.now();
    
    // Helper function to find label element with multiple fallback strategies
    function findLabelElement(propertyElement) {
        // Strategy 1: Most specific selector first (most likely to succeed)
        let labelElement = propertyElement.querySelector('[class*="TruncateString__TruncateStringInner"] span');
        if (labelElement) return labelElement;
        
        // Strategy 2: Look for any element with FormControl label classes
        labelElement = propertyElement.querySelector('[class*="FormControl__LabelWrapper"] span');
        if (labelElement) return labelElement;
        
        // Strategy 3: Look for label by data-test-id pattern (fallback)
        const testId = propertyElement.getAttribute('data-test-id');
        if (testId) {
            // Try to find label by looking for elements that contain the property name
            const allSpans = propertyElement.querySelectorAll('span');
            for (const span of allSpans) {
                if (span.textContent && span.textContent.trim() && 
                    !span.querySelector('.internal-property-code') &&
                    span.textContent.length < 100) { // Likely a label
                    return span;
                }
            }
        }
        
        return null;
    }

    // Use more efficient selectors and limit the scope
    const sidebarProperties = document.querySelectorAll('span[data-test-id]');
    const allPropertiesView = document.querySelectorAll('[data-profile-property]');
    const lineItemModalInputs = document.querySelectorAll('[data-test-id^="property-input-"], [data-test-id^="line-item-"], [data-test-id^="product-"]');
    
    console.log(`HubSpot Helper: Found ${sidebarProperties.length} sidebar properties, ${allPropertiesView.length} profile properties, ${lineItemModalInputs.length} line item inputs`);
    
    // Process properties in batches to avoid blocking
    const processBatch = (elements, processor, batchSize = 10) => {
        let processed = 0;
        const total = elements.length;
        
        const processNextBatch = () => {
            const end = Math.min(processed + batchSize, total);
            
            for (let i = processed; i < end; i++) {
                processor(elements[i]);
            }
            
            processed = end;
            
            if (processed < total) {
                // Use requestIdleCallback for better performance, fallback to setTimeout
                if (window.requestIdleCallback) {
                    requestIdleCallback(() => processNextBatch(), { timeout: 100 });
                } else {
                    setTimeout(processNextBatch, 10);
                }
            }
        };
        
        processNextBatch();
    };
    
    // Process sidebar properties
    processBatch(sidebarProperties, (propertyElement) => {
        const internalName = propertyElement.getAttribute('data-test-id');
        const labelElement = findLabelElement(propertyElement);
        
        if (labelElement && !labelElement.querySelector('.internal-property-code')) {
            addInternalNameToLabel(labelElement, internalName);
        }
    });
    
    // Process profile properties
    processBatch(allPropertiesView, (propertyElement) => {
        const internalName = propertyElement.getAttribute('data-profile-property');
        const labelElement = findLabelElement(propertyElement);
        
        if (labelElement && !labelElement.querySelector('.internal-property-code')) {
            addInternalNameToLabel(labelElement, internalName);
        }
    });

    // Process line item inputs
    processBatch(lineItemModalInputs, (inputElement) => {
        const dataTestId = inputElement.getAttribute('data-test-id');
        if (!dataTestId) return;
        
        // Handle the special cases for name, quantity, price, unit cost, and margin fields
        let internalName;
        if (dataTestId === 'line-item-name-input') {
            internalName = 'name';
        } else if (dataTestId === 'line-item-quantity-input') {
            internalName = 'quantity';
        } else if (dataTestId === 'line-item-cost-price-input') {
            internalName = 'price';
        } else if (dataTestId === 'product-unit-cost-input') {
            internalName = 'hs_cost_of_goods_sold';
        } else if (dataTestId === 'product-price-margin-input') {
            internalName = 'hs_margin';
        } else {
            internalName = dataTestId.replace('property-input-', '').toLowerCase();
        }
        
        // Find the label element with optimized search
        let labelElement = null;
        
        // Look for label in the same form control wrapper
        const formControl = inputElement.closest('[class*="FormControl__StyledFormControlWrapper"]');
        if (formControl) {
            labelElement = formControl.querySelector('[class*="TruncateString__TruncateStringInner"] span');
        }
        
        // Fallback: Look for label by aria-labelledby
        if (!labelElement && inputElement.getAttribute('aria-labelledby')) {
            const labelId = inputElement.getAttribute('aria-labelledby').split(' ')[0];
            const labelById = document.getElementById(labelId);
            if (labelById) {
                labelElement = labelById.querySelector('[class*="TruncateString__TruncateStringInner"] span');
            }
        }
        
        if (labelElement && !labelElement.querySelector('.internal-property-code')) {
            addInternalNameToLabel(labelElement, internalName);
        }
    });
    
    const endTime = performance.now();
    console.log(`HubSpot Helper: Finished processing in ${(endTime - startTime).toFixed(2)}ms`);
}

function addInternalNameInfo(headerElement, labelElement, internalName) {
    // Create info button
    const infoButton = document.createElement('span');
    infoButton.className = 'internal-property-info';
    infoButton.innerHTML = 'ℹ️';
    infoButton.style.cssText = `
        cursor: pointer;
        margin-left: 4px;
        font-size: 14px;
        opacity: 0.7;
        vertical-align: middle;
    `;
    
    // Create popup container
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 8px 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        z-index: 9999;
        display: none;
        font-size: 12px;
        color: #333;
    `;
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.style.cssText = 'display: flex; align-items: center; gap: 8px;';
    
    // Add internal name
    const codeElement = document.createElement('span');
    codeElement.className = 'internal-property-code';
    codeElement.style.cssText = 'cursor: pointer; user-select: all;';
    codeElement.textContent = internalName;
    
    // Add link
    const linkElement = document.createElement('a');
    linkElement.className = 'internal-property-link';
    linkElement.innerHTML = '⚙️';
    linkElement.style.cssText = 'text-decoration: none; font-size: 12px; color: #666; cursor: pointer;';
    linkElement.setAttribute('title', 'Edit property');
    
    const pathParts = window.location.pathname.split('/');
    const portalId = pathParts[2];
    const isLineItemsPage = window.location.pathname.includes('/line-items/');
    const objectType = isLineItemsPage ? '0-7' : (window.location.pathname.match(/\/(\d+-\d+)\//) ? window.location.pathname.match(/\/(\d+-\d+)\//)[1] : '0-1');
    
    linkElement.href = `https://app.hubspot.com/property-settings/${portalId}/properties?type=${objectType}&action=edit&property=${internalName}`;
    linkElement.target = '_blank';
    
    // Add copy feedback
    const copyFeedback = document.createElement('span');
    copyFeedback.style.cssText = 'font-size: 11px; color: #4CAF50; display: none;';
    copyFeedback.textContent = 'Copied!';
    
    popupContent.appendChild(codeElement);
    popupContent.appendChild(linkElement);
    popupContent.appendChild(copyFeedback);
    popup.appendChild(popupContent);
    
    // Add elements to the page
    labelElement.appendChild(infoButton);
    document.body.appendChild(popup);
    
    // Handle click on info button
    infoButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const rect = infoButton.getBoundingClientRect();
        popup.style.left = `${rect.left}px`;
        popup.style.top = `${rect.bottom + 5}px`;
        popup.style.display = 'block';
    });
    
    // Close popup when clicking outside
    document.addEventListener('click', (event) => {
        if (!popup.contains(event.target) && event.target !== infoButton) {
            popup.style.display = 'none';
            copyFeedback.style.display = 'none';
        }
    });
    
    // Handle copy
    codeElement.addEventListener('click', async (event) => {
        event.stopPropagation();
        try {
            await navigator.clipboard.writeText(internalName);
            copyFeedback.style.display = 'inline';
            setTimeout(() => {
                copyFeedback.style.display = 'none';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });
}

function addInternalNameToLabel(labelElement, internalName) {
    // Check if we already added this to avoid duplicates
    if (labelElement.querySelector('.internal-property-code')) {
        return;
    }
    
    // Create container with all elements at once for better performance
    const container = document.createElement('span');
    container.className = 'internal-property-container';
    container.innerHTML = `
        <span class="internal-property-code" role="button" tabindex="0">(${internalName.toLowerCase()})</span>
        <a class="internal-property-link" title="Edit property" target="_blank">⚙️</a>
        <span class="internal-property-tooltip" role="tooltip">Click to copy</span>
    `;
    
    // Get references to the created elements
    const codeElement = container.querySelector('.internal-property-code');
    const linkElement = container.querySelector('.internal-property-link');
    const tooltip = container.querySelector('.internal-property-tooltip');
    
    // Set up the link
    const pathParts = window.location.pathname.split('/');
    const portalId = pathParts[2];
    const isLineItemsPage = window.location.pathname.includes('/line-items/');
    const objectType = isLineItemsPage ? '0-7' : (window.location.pathname.match(/\/(\d+-\d+)\//) ? window.location.pathname.match(/\/(\d+-\d+)\//)[1] : '0-1');
    
    linkElement.href = `https://app.hubspot.com/property-settings/${portalId}/properties?type=${objectType}&action=edit&property=${internalName}`;
    
    // Add to the page
    labelElement.appendChild(container);
    
    // Set up event listeners
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

// Prevent multiple initializations
if (window.hubspotHelperInitialized) {
    console.log('HubSpot Helper: Already initialized, skipping...');
} else {
    window.hubspotHelperInitialized = true;
    
    // Initial call
    addInternalNames();
    
    // Set up observer with debouncing and performance optimization
    let debounceTimer;
    const observer = new MutationObserver(mutations => {
        // Clear any pending debounce
        clearTimeout(debounceTimer);
        
        // Only process if there are actual additions
        const hasAdditions = mutations.some(mutation => 
            mutation.addedNodes.length > 0 && 
            Array.from(mutation.addedNodes).some(node => 
                node.nodeType === Node.ELEMENT_NODE
            )
        );
        
        if (hasAdditions) {
            // Debounce the processing to avoid excessive calls
            debounceTimer = setTimeout(() => {
                // Only run if the page is not actively loading
                if (document.readyState === 'complete' && !document.hidden) {
                    addInternalNames();
                }
            }, 300); // 300ms debounce
        }
    });
    
    // Observe with more specific options to reduce unnecessary processing
    observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: false, // Don't watch attribute changes
        characterData: false // Don't watch text changes
    });
    
    console.log('HubSpot Helper: Initialized successfully');
}