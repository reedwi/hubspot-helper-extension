function addInternalNames() {
    // Handle both types of property elements
    const sidebarProperties = document.querySelectorAll('span[data-test-id]');
    const allPropertiesView = document.querySelectorAll('[data-profile-property]');
    const lineItemsTableHeaders = document.querySelectorAll('th[data-table-external-id^="header-DEFAULT_NAMESPACE-"]');
    const lineItemModalInputs = document.querySelectorAll('input[data-test-id^="property-input-"], textarea[data-test-id^="property-input-"], [data-test-id^="property-input-"][role="button"], textarea[data-test-id="line-item-name-input"], input[data-test-id="line-item-quantity-input"], input[data-test-id="line-item-cost-price-input"], input[data-test-id="product-unit-cost-input"], input[data-test-id="product-price-margin-input"]');
    
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

    // Handle line items table headers
    lineItemsTableHeaders.forEach(headerElement => {
        const dataTableExternalId = headerElement.getAttribute('data-table-external-id');
        const internalName = dataTableExternalId.replace('header-DEFAULT_NAMESPACE-', '').toLowerCase();
        const labelElement = headerElement.querySelector('[data-test-id="truncated-object-label"]');
        
        if (labelElement && !headerElement.querySelector('.internal-property-info')) {
            addInternalNameInfo(headerElement, labelElement, internalName);
        }
    });

    // Handle line item modal inputs
    lineItemModalInputs.forEach(inputElement => {
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
        
        // Find the label element
        let labelElement = null;
        
        // Method 1: Look for label in the same form set
        const formSet = inputElement.closest('.private-form__set');
        if (formSet) {
            // Look for the label wrapper first
            const labelWrapper = formSet.querySelector('.UIFormControl__LabelWrapper-sc-1cnyvh8-1');
            if (labelWrapper) {
                // Then look for the span inside the label
                labelElement = labelWrapper.querySelector('.UIFormControl__StyledSpan-sc-1cnyvh8-2');
            }
        }
        
        // Method 2: Look for label by ID
        if (!labelElement && inputElement.id) {
            const labelId = inputElement.id.replace('UIFormControl-', 'UIFormControl-label-');
            const labelById = document.getElementById(labelId);
            if (labelById) {
                labelElement = labelById.querySelector('.UIFormControl__StyledSpan-sc-1cnyvh8-2');
            }
        }
        
        // Method 3: Look for label by aria-labelledby
        if (!labelElement && inputElement.getAttribute('aria-labelledby')) {
            const labelIds = inputElement.getAttribute('aria-labelledby').split(' ');
            for (const labelId of labelIds) {
                const labelById = document.getElementById(labelId);
                if (labelById) {
                    labelElement = labelById.querySelector('.UIFormControl__StyledSpan-sc-1cnyvh8-2');
                    if (labelElement) break;
                }
            }
        }
        
        // Method 4: For complex fields like discount, look for the parent fieldset's label
        if (!labelElement) {
            const fieldset = inputElement.closest('fieldset');
            if (fieldset) {
                const parentFormSet = fieldset.closest('.private-form__set');
                if (parentFormSet) {
                    const labelWrapper = parentFormSet.querySelector('.UIFormControl__LabelWrapper-sc-1cnyvh8-1');
                    if (labelWrapper) {
                        labelElement = labelWrapper.querySelector('.UIFormControl__StyledSpan-sc-1cnyvh8-2');
                    }
                }
            }
        }
        
        // Method 5: For quantity field, look for the FormControl label
        if (!labelElement && dataTestId === 'line-item-quantity-input') {
            const formControl = inputElement.closest('.FormControl__StyledBorderIndicator-sc-1m9hs6o-8');
            if (formControl) {
                const labelWrapper = formControl.querySelector('.FormControl__LabelWrapper-sc-1m9hs6o-0');
                if (labelWrapper) {
                    const labelContainer = labelWrapper.querySelector('.FormControl__StyledLabelContainer-sc-1m9hs6o-2');
                    if (labelContainer) {
                        labelElement = labelContainer.querySelector('.FormControl__StyledInnerLabel-sc-1m9hs6o-4');
                    }
                }
            }
        }
        
        if (labelElement && !labelElement.querySelector('.internal-property-code')) {
            addInternalNameToLabel(labelElement, internalName);
        }
    });
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
    const container = document.createElement('span');
    container.className = 'internal-property-container';
    
    const codeElement = document.createElement('span');
    codeElement.className = 'internal-property-code';
    codeElement.setAttribute('role', 'button');
    codeElement.setAttribute('tabindex', '0');
    codeElement.textContent = `(${internalName.toLowerCase()})`;
    
    const linkElement = document.createElement('a');
    linkElement.className = 'internal-property-link';
    linkElement.innerHTML = '⚙️';
    linkElement.setAttribute('title', 'Edit property');
    
    const pathParts = window.location.pathname.split('/');
    const portalId = pathParts[2];
    const isLineItemsPage = window.location.pathname.includes('/line-items/');
    const objectType = isLineItemsPage ? '0-7' : (window.location.pathname.match(/\/(\d+-\d+)\//) ? window.location.pathname.match(/\/(\d+-\d+)\//)[1] : '0-1');
    
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