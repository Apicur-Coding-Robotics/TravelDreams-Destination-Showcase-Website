const animals = [
    {
        id: 1,
        name: 'Bessie',
        type: 'Dairy Cow',
        age: '4 yrs',
        healthStatus: 'Healthy',
        lastFed: '2026-06-09T18:00:00',
        nextFeed: '2026-06-10T06:30:00',
        feedType: 'Hay + Grain',
        nextVaccine: '2026-06-15',
        vaccineName: 'Brucellosis',
        vaccineStatus: 'Due'
    },
    {
        id: 2,
        name: 'Molly',
        type: 'Goat',
        age: '2 yrs',
        healthStatus: 'Needs attention',
        lastFed: '2026-06-09T20:00:00',
        nextFeed: '2026-06-10T08:00:00',
        feedType: 'Grain Mix',
        nextVaccine: '2026-06-14',
        vaccineName: 'CDT Booster',
        vaccineStatus: 'Due'
    },
    {
        id: 3,
        name: 'Henri',
        type: 'Horse',
        age: '7 yrs',
        healthStatus: 'Healthy',
        lastFed: '2026-06-09T17:00:00',
        nextFeed: '2026-06-10T07:30:00',
        feedType: 'Oats + Straw',
        nextVaccine: '2026-07-01',
        vaccineName: 'Tetanus',
        vaccineStatus: 'Scheduled'
    },
    {
        id: 4,
        name: 'Daisy',
        type: 'Sheep',
        age: '3 yrs',
        healthStatus: 'Healthy',
        lastFed: '2026-06-09T19:00:00',
        nextFeed: '2026-06-10T09:00:00',
        feedType: 'Hay',
        nextVaccine: '2026-06-12',
        vaccineName: 'Foot Rot',
        vaccineStatus: 'Due'
    }
];

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString([], {
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
        day: 'numeric'
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function hoursUntil(dateString) {
    const now = new Date();
    const target = new Date(dateString);
    return Math.max(0, Math.round((target - now) / 36e5));
}

function renderAnimals() {
    const container = document.getElementById('animalCards');
    container.innerHTML = '';
    animals.forEach((animal) => {
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
            <h3>${animal.name}</h3>
            <p><strong>Type:</strong> ${animal.type}</p>
            <p><strong>Age:</strong> ${animal.age}</p>
            <p><strong>Health:</strong> ${animal.healthStatus}</p>
            <p><strong>Last fed:</strong> ${formatTime(animal.lastFed)}</p>
            <p><strong>Next feed:</strong> ${formatTime(animal.nextFeed)}</p>
            <div class="label">${animal.feedType}</div>
            <div class="badge"><span class="status-dot ${animal.healthStatus === 'Healthy' ? 'healthy' : animal.healthStatus === 'Needs attention' ? 'attention' : 'alert'}"></span>${animal.healthStatus}</div>
        `;
        container.appendChild(card);
    });

    document.getElementById('animalTotal').textContent = animals.length;
}

function renderFeeding() {
    const table = document.getElementById('feedingTable');
    table.innerHTML = '';
    animals
        .slice()
        .sort((a, b) => new Date(a.nextFeed) - new Date(b.nextFeed))
        .forEach((animal) => {
            const status = hoursUntil(animal.nextFeed) <= 3 ? 'Due soon' : 'On schedule';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${animal.name}</td>
                <td>${formatTime(animal.nextFeed)}</td>
                <td>${animal.feedType}</td>
                <td>${status}</td>
                <td><button class="primary" data-action="feed" data-id="${animal.id}">Mark fed</button></td>
            `;
            table.appendChild(row);
        });
}

function renderVaccines() {
    const table = document.getElementById('vaccineTable');
    table.innerHTML = '';
    animals
        .slice()
        .sort((a, b) => new Date(a.nextVaccine) - new Date(b.nextVaccine))
        .forEach((animal) => {
            const due = new Date() > new Date(animal.nextVaccine);
            const status = animal.vaccineStatus === 'Completed' ? 'Completed' : due ? 'Overdue' : 'Pending';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${animal.name}</td>
                <td>${animal.vaccineName}</td>
                <td>${formatDate(animal.nextVaccine)}</td>
                <td>${status}</td>
                <td><button class="primary" data-action="vaccine" data-id="${animal.id}">${animal.vaccineStatus === 'Completed' ? 'Done' : 'Mark done'}</button></td>
            `;
            table.appendChild(row);
        });
}

function renderStats() {
    const total = animals.length;
    const healthy = animals.filter((a) => a.healthStatus === 'Healthy').length;
    const dueFeed = animals.filter((a) => hoursUntil(a.nextFeed) <= 3).length;
    const dueVax = animals.filter((a) => a.vaccineStatus !== 'Completed' && new Date(a.nextVaccine) <= new Date()).length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statHealthy').textContent = healthy;
    document.getElementById('statDueFeed').textContent = dueFeed;
    document.getElementById('statDueVax').textContent = dueVax;
}

function renderReminders() {
    const list = document.getElementById('reminderList');
    const summary = document.getElementById('reportSummary');
    list.innerHTML = '';
    summary.innerHTML = '';

    const reminders = [];

    animals.forEach((animal) => {
        const feedHours = hoursUntil(animal.nextFeed);
        if (feedHours <= 3) {
            reminders.push({
                title: `${animal.name} needs feeding`,
                message: `${animal.name} should be fed in ${feedHours} hour${feedHours !== 1 ? 's' : ''}.`,
            });
        }

        if (animal.vaccineStatus !== 'Completed' && new Date(animal.nextVaccine) <= new Date()) {
            reminders.push({
                title: `${animal.name} vaccine due`,
                message: `${animal.vaccineName} is due for ${animal.name}.`,
            });
        }
    });

    if (reminders.length === 0) {
        list.innerHTML = '<div class="reminder"><strong>No active reminders.</strong><p>All animals are currently on schedule.</p></div>';
    } else {
        reminders.forEach((reminder) => {
            const card = document.createElement('div');
            card.className = 'reminder';
            card.innerHTML = `<strong>${reminder.title}</strong><p>${reminder.message}</p>`;
            list.appendChild(card);
        });
    }

    const nextReminder = reminders.length ? reminders[0].title : 'No reminders';
    document.getElementById('nextReminder').textContent = nextReminder;

    summary.innerHTML = `
        <div class="reminder"><strong>Health summary</strong><p>Healthy animals: ${animals.filter(a => a.healthStatus === 'Healthy').length}</p></div>
        <div class="reminder"><strong>Feeding priority</strong><p>${animals.filter(a => hoursUntil(a.nextFeed) <= 3).length} upcoming feedings in the next 3 hours.</p></div>
        <div class="reminder"><strong>Vaccination due</strong><p>${animals.filter(a => a.vaccineStatus !== 'Completed' && new Date(a.nextVaccine) <= new Date()).length} vaccines overdue or due today.</p></div>
    `;
}

function refreshAll() {
    renderAnimals();
    renderFeeding();
    renderVaccines();
    renderStats();
    renderReminders();
}

function updateAnimalStatus(id, action) {
    const animal = animals.find((item) => item.id === Number(id));
    if (!animal) return;

    if (action === 'feed') {
        const now = new Date();
        animal.lastFed = now.toISOString();
        const next = new Date(now.getTime() + 12 * 60 * 60 * 1000);
        animal.nextFeed = next.toISOString();
    }

    if (action === 'vaccine') {
        animal.vaccineStatus = 'Completed';
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + 6);
        animal.nextVaccine = nextDate.toISOString().slice(0, 10);
    }

    refreshAll();
}

document.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName === 'BUTTON' && target.dataset.action) {
        updateAnimalStatus(target.dataset.id, target.dataset.action);
    }
});

document.getElementById('refreshFeeding').addEventListener('click', renderFeeding);

document.getElementById('refreshVaccines').addEventListener('click', renderVaccines);

refreshAll();
