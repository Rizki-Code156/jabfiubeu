const API_BASE_URL = window.BASE_URL || window.location.origin;

let dataKategori = [];

const tableBody     = document.getElementById('kategori-table-body');
const searchInput   = document.getElementById('search-input');
const modal         = document.getElementById('kategori-modal');
const modalTitle    = document.getElementById('modal-title');
const form          = document.getElementById('kategori-form');
const btnTambah     = document.getElementById('btn-tambah');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnBatal      = document.getElementById('btn-batal');

// ─── Fetch dari API ────────────────────────────────────────────────────────────
async function loadKategori() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/kategori.php`, { credentials: 'include' });
    const json = await res.json();
    if (!json.status || !Array.isArray(json.data)) throw new Error(json.message || 'Gagal memuat kategori');
    dataKategori = json.data;
    renderTable(dataKategori);
  } catch (err) {
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:red;padding:20px;">${err.message}</td></tr>`;
  }
}

// ─── Render Tabel ──────────────────────────────────────────────────────────────
function renderTable(data) {
  if (!tableBody) return;
  tableBody.innerHTML = '';

  if (!data || data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;">Kategori tidak ditemukan.</td></tr>`;
    return;
  }

  data.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${escapeHtml(item.nama_kategori || item.nama || '-')}</strong></td>
      <td>
        <button class="btn btn-edit" data-id="${item.id_kategori}">Edit</button>
        <button class="btn btn-danger" data-id="${item.id_kategori}">Hapus</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Event listener edit & hapus
  tableBody.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => editKategori(btn.dataset.id));
  });
  tableBody.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', () => hapusKategori(btn.dataset.id));
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
function openModal(title = 'Tambah Kategori Baru', id = '', nama = '') {
  if (form) form.reset();
  const idInput = document.getElementById('kategori-id');
  const namaInput = document.getElementById('nama-kategori');
  if (idInput) idInput.value = id;
  if (namaInput) namaInput.value = nama;
  if (modalTitle) modalTitle.textContent = title;
  if (modal) modal.classList.remove('hidden');
}

function closeModal() {
  if (modal) modal.classList.add('hidden');
}

if (btnTambah) btnTambah.addEventListener('click', () => openModal());
if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
if (btnBatal) btnBatal.addEventListener('click', closeModal);

// ─── Submit Form (Tambah / Edit) ──────────────────────────────────────────────
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id   = document.getElementById('kategori-id')?.value;
    const nama = document.getElementById('nama-kategori')?.value?.trim();
    if (!nama) return;

    try {
      const method = id ? 'PUT' : 'POST';
      const url    = id
        ? `${API_BASE_URL}/api/kategori.php?id=${encodeURIComponent(id)}`
        : `${API_BASE_URL}/api/kategori.php`;

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama_kategori: nama }),
      });
      const json = await res.json();
      if (!json.status) throw new Error(json.message || 'Gagal menyimpan');
      closeModal();
      await loadKategori();
    } catch (err) {
      alert(err.message);
    }
  });
}

// ─── Edit ──────────────────────────────────────────────────────────────────────
function editKategori(id) {
  const item = dataKategori.find(k => String(k.id_kategori) === String(id));
  if (item) openModal('Edit Kategori Kuliner', item.id_kategori, item.nama_kategori || item.nama || '');
}

// ─── Hapus ─────────────────────────────────────────────────────────────────────
async function hapusKategori(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/kategori.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.status) throw new Error(json.message || 'Gagal menghapus');
    await loadKategori();
  } catch (err) {
    alert(err.message);
  }
}

// ─── Pencarian ─────────────────────────────────────────────────────────────────
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = dataKategori.filter(item =>
      (item.nama_kategori || item.nama || '').toLowerCase().includes(keyword)
    );
    renderTable(filtered);
  });
}

// ─── Init ──────────────────────────────────────────────────────────────────────
loadKategori();
