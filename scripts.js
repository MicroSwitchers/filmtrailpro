let filmRolls = [];
const filmCompanies = ['Kodak', 'Fujifilm', 'Ilford', 'Lomography', 'CineStill', 'Fomapan', 'Rollei', 'Agfa'];
const cameraBrands = ['Bronica', 'Contax', 'Fujifilm', 'Holga', 'Konica', 'Polaroid', 'Ricoh', 'Vivitar'];
const lensBrands = ['Canon', 'Nikon', 'Pentax', 'Olympus', 'Minolta', 'Leica', 'Mamiya', 'Hasselblad', 'Zeiss', 'Schneider', 'Konica', 'Other Lens'];
const isoSpeeds = ['50', '100', '125', '200', '400', '800', '1600', '3200'];
const filmFormats = ['110', '35mm', 'Polaroid', '120', '220', '4x5', '8x10'];
const tagColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];

// Prevent accidental page refresh or navigation
window.onbeforeunload = function() {
    return "Are you sure you want to leave? Your data may not be saved.";
};

// Ensure addFilmRoll is called on page load and current date is set
document.addEventListener("DOMContentLoaded", () => {
    addFilmRoll();
    setCurrentDate(); // Added this line to set the current date
});

function setCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    dateElement.textContent = dateStr;
}

function createDatalistInput(id, placeholder, options, value, onchange) {
    return `
        <input id="${id}" name="${id}" list="${id}-datalist" placeholder="${placeholder}" value="${value || ''}" onchange="${onchange}">
        <datalist id="${id}-datalist">
            ${options.map(option => `<option value="${option}">`).join('')}
        </datalist>
    `;
}

function renderFilmRolls() {
    const container = document.getElementById('film-rolls');
    container.innerHTML = '';
    if (filmRolls.length === 0) {
        container.innerHTML = '<p>No rolls to display. Please add a new film roll.</p>';
        return;
    }
    filmRolls.forEach((roll, rollIndex) => {
        const rollDiv = document.createElement('div');
        rollDiv.className = 'film-roll';
        rollDiv.innerHTML = document.getElementById('roll-template').innerHTML
            .replace(/{rollIndex}/g, rollIndex)
            .replace(/{rollNumber}/g, rollIndex + 1);
        container.appendChild(rollDiv);
        renderFrames(rollIndex);
        updateRollTitle(rollIndex);
    });
}

function openTab(event, tabId) {
    const tabContent = event.currentTarget.closest('.drawer-content').querySelectorAll('.tab-content');
    tabContent.forEach(tab => tab.classList.remove('active'));

    const tabs = event.currentTarget.closest('.tab-container').querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

function toggleDrawer(rollIndex) {
    const drawerContent = document.getElementById(`drawer-content-${rollIndex}`);
    const drawerToggleBtn = document.querySelector(`#drawer-toggle-${rollIndex}`);
    if (drawerContent.classList.contains('open')) {
        drawerContent.classList.remove('open');
        drawerToggleBtn.textContent = 'Show Film / Camera / Lens Details';
    } else {
        drawerContent.classList.add('open');
        drawerToggleBtn.textContent = 'Hide Film / Camera / Lens Details';
    }
}

function toggleFramesDrawer(rollIndex) {
    const drawerContent = document.getElementById(`frames-drawer-content-${rollIndex}`);
    const drawerToggleBtn = document.querySelector(`#frames-drawer-toggle-${rollIndex}`);
    if (drawerContent.classList.contains('open')) {
        drawerContent.classList.remove('open');
        drawerToggleBtn.textContent = 'Show Frames';
    } else {
        drawerContent.classList.add('open');
        drawerToggleBtn.textContent = 'Hide Frames';
    }
}

function confirmLens(rollIndex) {
    let brand = document.getElementById(`lens-brand-${rollIndex}`).value || 'Other Lens';
    let fstop = document.getElementById(`lens-fstop-${rollIndex}`).value;
    let focal = document.getElementById(`lens-focal-${rollIndex}`).value;

    // Ensure prefixes/suffixes are correctly applied
    if (fstop && !fstop.startsWith('f/')) {
        fstop = 'f/' + fstop;
    }
    if (focal && !focal.endsWith('mm')) {
        focal = focal.replace('mm', '') + 'mm'; // Remove any stray 'mm' and reapply it correctly
    }

    const lensTag = `${brand}${fstop ? ` ${fstop}` : ''}${focal ? ` ${focal}` : ''}`;
    addLensTag(rollIndex, lensTag);

    // Clear the input fields
    document.getElementById(`lens-brand-${rollIndex}`).value = '';
    document.getElementById(`lens-fstop-${rollIndex}`).value = 'f/';
    document.getElementById(`lens-focal-${rollIndex}`).value = '';

    renderFrames(rollIndex); // Update frames dropdown when a new lens is added
}

function addLensTag(rollIndex, lensTag) {
    const lensTagsContainer = document.getElementById(`lens-tags-${rollIndex}`);
    const lensTags = filmRolls[rollIndex].lensTags || [];

    if (!lensTags.includes(lensTag)) {
        lensTags.push(lensTag);
        filmRolls[rollIndex].lensTags = lensTags;

        const tagDiv = document.createElement('div');
        tagDiv.className = 'tag';
        const color = tagColors[lensTags.length % tagColors.length]; // Cycle through colors
        tagDiv.style.backgroundColor = color;
        tagDiv.innerHTML = `
            <span>${lensTag}</span>
            <span class="tag-remove" onclick="removeLensTag(${rollIndex}, '${lensTag}')">&times;</span>
        `;
        tagDiv.dataset.color = color; // Store the color in a data attribute for later use
        lensTagsContainer.appendChild(tagDiv);

        // Show the tag container when tags are added
        lensTagsContainer.classList.add('active');
    }
}

function removeLensTag(rollIndex, lensTag) {
    const lensTagsContainer = document.getElementById(`lens-tags-${rollIndex}`);
    const lensTags = filmRolls[rollIndex].lensTags || [];

    const index = lensTags.indexOf(lensTag);
    if (index !== -1) {
        lensTags.splice(index, 1);
        filmRolls[rollIndex].lensTags = lensTags;

        lensTagsContainer.innerHTML = '';
        lensTags.forEach(tag => addLensTag(rollIndex, tag));

        // Hide the tag container if no tags are left
        if (lensTags.length === 0) {
            lensTagsContainer.classList.remove('active');
        }

        renderFrames(rollIndex); // Update frames dropdown when a lens is removed
    }
}

function renderFrames(rollIndex) {
    const framesContainer = document.getElementById(`frames-${rollIndex}`);
    framesContainer.innerHTML = '';
    filmRolls[rollIndex].frames.forEach((frame, frameIndex) => {
        const frameDiv = document.createElement('div');
        frameDiv.className = 'frame';
        frameDiv.innerHTML = `
            <label>Frame ${frameIndex + 1}</label>
            <select id="frame-lens-${rollIndex}-${frameIndex}" onchange="updateFrame(${rollIndex}, ${frameIndex}, 'lens', this.value)">
                <option value="">Select Lens</option>
                ${filmRolls[rollIndex].lensTags.map(lens => {
                    const color = getTagColor(rollIndex, lens);
                    return `<option value="${lens}" style="background-color: ${color};" ${frame.lens === lens ? 'selected' : ''}>${lens}</option>`;
                }).join('')}
            </select>
            <input type="text" placeholder="f/" value="${frame.fStop || 'f/'}" oninput="prefixInput(this, 'f/')" onchange="updateFrame(${rollIndex}, ${frameIndex}, 'fStop', this.value)">
            <input type="text" placeholder="1/" value="${frame.shutterSpeed || '1/'}" oninput="prefixInput(this, '1/')" onchange="updateFrame(${rollIndex}, ${frameIndex}, 'shutterSpeed', this.value)">
            <input type="text" placeholder="Notes" value="${frame.notes || ''}" onchange="updateFrame(${rollIndex}, ${frameIndex}, 'notes', this.value)">
        `;
        framesContainer.appendChild(frameDiv);

        // Apply the background color to the frame's select box if a lens is selected
        const frameLensSelect = document.getElementById(`frame-lens-${rollIndex}-${frameIndex}`);
        if (frame.lens) {
            const color = getTagColor(rollIndex, frame.lens);
            frameLensSelect.style.backgroundColor = color;
        }

        frameLensSelect.addEventListener('change', function () {
            const selectedLens = this.value;
            const color = getTagColor(rollIndex, selectedLens);
            this.style.backgroundColor = color;
        });
    });

    updateFrameHeader(rollIndex);  // Update frame count in the header
}

function getTagColor(rollIndex, lensTag) {
    const lensTagsContainer = document.getElementById(`lens-tags-${rollIndex}`);
    const tagElements = lensTagsContainer.getElementsByClassName('tag');
    for (let tag of tagElements) {
        if (tag.textContent.includes(lensTag)) {
            return tag.dataset.color;
        }
    }
    return 'transparent'; // Default color if no match found
}

function addFilmRoll() {
    filmRolls.push({ company: '', stock: '', iso: '', format: '', cameraBrand: '', cameraModel: '', lensTags: [], frames: [] });
    renderFilmRolls();
}

function updateRollInfo(rollIndex, field, value) {
    filmRolls[rollIndex][field] = value;
    updateRollTitle(rollIndex);
}

function updateRollTitle(rollIndex) {
    const roll = filmRolls[rollIndex];
    const mainInfoElement = document.getElementById(`roll-main-info-${rollIndex}`);
    const subInfoElement = document.getElementById(`roll-sub-info-${rollIndex}`);
    
    let mainInfo = [];
    if (roll.company) mainInfo.push(roll.company);
    if (roll.stock) mainInfo.push(roll.stock);
    
    let subInfo = [];
    if (roll.iso) subInfo.push(`ISO ${roll.iso}`);
    if (roll.format) subInfo.push(roll.format);
    if (roll.cameraBrand) subInfo.push(roll.cameraBrand);
    if (roll.cameraModel) subInfo.push(roll.cameraModel);

    mainInfoElement.textContent = mainInfo.join(' ');
    subInfoElement.textContent = subInfo.join(' · ');
}

function deleteRoll(rollIndex) {
    if (confirm('Are you sure you want to delete this roll?')) {
        filmRolls.splice(rollIndex, 1);
        renderFilmRolls();
    }
}

function addFrame(rollIndex) {
    filmRolls[rollIndex].frames.push({ number: filmRolls[rollIndex].frames.length + 1, fStop: '', shutterSpeed: '', notes: '', lens: '' });
    renderFrames(rollIndex);
    updateFrameHeader(rollIndex);  // Update frame count in the header
}

function updateFrame(rollIndex, frameIndex, field, value) {
    filmRolls[rollIndex].frames[frameIndex][field] = value;
}

function updateFrameHeader(rollIndex) {
    const framesCount = filmRolls[rollIndex].frames.length;
    const framesCountElement = document.getElementById(`frame-count-${rollIndex}`);
    framesCountElement.textContent = `(${framesCount})`;
}

function prefixInput(input, prefix) {
    if (!input.value.startsWith(prefix)) {
        input.value = prefix + input.value.replace(prefix, '');
    }
}

function ensureSuffix(input, suffix) {
    if (!input.value.endsWith(suffix)) {
        input.value = suffix;
    }
    input.setSelectionRange(0, 0); // Place cursor before suffix
}

function handleFocalInput(input) {
    // Remove any characters after the number (should only have "mm" as suffix)
    let value = input.value.replace(/[^0-9]/g, '');
    input.value = value + 'mm';
    input.setSelectionRange(value.length, value.length); // Keep cursor at the end of the number
}

function saveNotes() {
    const jsonString = JSON.stringify(filmRolls, null, 2);
    const blob = new Blob([jsonString], {type: "application/json"});

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const filename = `filmlog-${dateStr}.json`; // Updated naming convention

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function loadNotesFromFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                filmRolls = JSON.parse(e.target.result);
                renderFilmRolls();
                alert('Notes loaded successfully!');
            } catch (error) {
                console.error('Error parsing file:', error);
                alert('Error loading file. Please make sure it\'s a valid JSON file.');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the app
renderFilmRolls();
