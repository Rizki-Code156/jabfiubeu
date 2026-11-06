document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = window.BASE_URL || window.location.origin;

  const authState = document.getElementById("authState");
  const adminApp = document.getElementById("adminApp");
  const authMessage = document.getElementById("authMessage");
  const authRetryButton = document.getElementById("authRetryButton");

  // Cek akses admin dulu
  async function checkAdminAccess() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/me.php`, { credentials: "include" });
      const result = await res.json();
      if (!result.status || result.role !== "admin") {
        window.location.replace("login.html");
        return;
      }
      if (authState) authState.hidden = true;
      if (adminApp) adminApp.hidden = false;
      fetchKulinerData();
    } catch (e) {
      if (authMessage) authMessage.textContent = "Gagal memeriksa akses. Coba lagi.";
      if (authRetryButton) authRetryButton.hidden = false;
    }
  }

  if (authRetryButton) authRetryButton.addEventListener("click", checkAdminAccess);

  const tableLoading = document.getElementById("tableLoading");
  const tableError = document.getElementById("tableError");
  const tableWrapper = document.getElementById("tableWrapper");
  const tableEmpty = document.getElementById("tableEmpty");
  const kulinerTableBody = document.getElementById("kulinerTableBody");
  const searchInput = document.getElementById("searchKuliner");
  const tableRetryButton = document.getElementById("tableRetryButton");
  const tableCard = document.querySelector(".table-card");

  let culinaryData = [];

  async function fetchKulinerData() {
    if (tableLoading) tableLoading.hidden = false;
    if (tableError) tableError.hidden = true;
    if (tableWrapper) tableWrapper.hidden = true;
    if (tableEmpty) tableEmpty.hidden = true;

    try {
      const endpointKuliner = `${API_BASE_URL}/api/admin/kuliner.php`;
      const endpointTempat = `${API_BASE_URL}/api/tempat_kuliner.php`;

      const [resKuliner, resTempat] = await Promise.all([
        fetch(endpointKuliner, { headers: { "Accept": "application/json" } }),
        fetch(endpointTempat, { headers: { "Accept": "application/json" } }).catch(() => null)
      ]);

      if (!resKuliner.ok) throw new Error("Gagal mengambil data dari server");

      const jsonKuliner = await resKuliner.json();
      const listKuliner = Array.isArray(jsonKuliner) ? jsonKuliner : (jsonKuliner.data || []);

      // Ambil data tempat kuliner (untuk alamat) jika berhasil di-fetch
      let listTempat = [];
      if (resTempat && resTempat.ok) {
        const jsonTempat = await resTempat.json();
        listTempat = Array.isArray(jsonTempat) ? jsonTempat : (jsonTempat.data || []);
      }

      // Buat mapping/kamus alamat berdasarkan id_kuliner
      const alamatMap = {};
      listTempat.forEach(t => {
        if (t.id_kuliner) {
          alamatMap[t.id_kuliner] = t.alamat || "-";
        }
      });

      // Gabungkan data kuliner dengan alamatnya di frontend
      culinaryData = listKuliner.map(item => {
        const idKul = item.id_kuliner;
        return {
          ...item,
          alamat: alamatMap[idKul] || "-"
        };
      });

      renderTable(culinaryData);
    } catch (error) {
      console.error("Error fetching culinary data:", error);
      if (tableLoading) tableLoading.hidden = true;
      if (tableWrapper) tableWrapper.hidden = true;
      if (tableCard) tableCard.hidden = true; // Sembunyikan kotak tabel utama
      if (tableError) tableError.hidden = false; // Tampilkan pesan error koneksi
    }
  }

  // Fungsi merender baris tabel ke HTML
  function renderTable(data) {
    if (tableLoading) tableLoading.hidden = true;
    
    if (!data || data.length === 0) {
      if (tableCard) tableCard.hidden = true;
      if (tableEmpty) tableEmpty.hidden = false;
      return;
    }

    if (tableCard) tableCard.hidden = false;
    if (tableEmpty) tableEmpty.hidden = true;
    if (tableWrapper) tableWrapper.hidden = false;
    if (kulinerTableBody) kulinerTableBody.innerHTML = "";

    data.forEach((item, index) => {
      const tr = document.createElement("tr");

      const fotoUrl = item.foto || item.image || "assets/default-kuliner.png";
      const namaKuliner = item.nama_kuliner || item.name || "Tanpa Nama";
      const kategori = item.nama_kategori || item.kategori || "Umum";
      const alamat = item.alamat || "-";
      const itemId = item.id_kuliner || item.id || index;

      tr.innerHTML = `
        <td><strong>${index + 1}.</strong></td>
        <td><img src="${fotoUrl}" alt="${namaKuliner}" class="table-img" onerror="this.src='assets/default-kuliner.png'"></td>
        <td>${namaKuliner}</td>
        <td>${kategori}</td>
        <td>${alamat}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-action btn-edit" data-id="${itemId}">
              <iconify-icon icon="lucide:pencil" aria-hidden="true"></iconify-icon> Edit
            </button>
            <button class="btn-action btn-delete" data-id="${itemId}">
              <iconify-icon icon="lucide:trash-2" aria-hidden="true"></iconify-icon> Hapus
            </button>
          </div>
        </td>
      `;
      if (kulinerTableBody) kulinerTableBody.appendChild(tr);
    });

    attachActionListeners();
  }

  // Fitur Pencarian Real-Time
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const keyword = e.target.value.toLowerCase();
      const filtered = culinaryData.filter(item => {
        const name = (item.nama_kuliner || "").toLowerCase();
        const category = (item.nama_kategori || "").toLowerCase();
        const address = (item.alamat || "").toLowerCase();
        return name.includes(keyword) || category.includes(keyword) || address.includes(keyword);
      });
      renderTable(filtered);
    });
  }

  function attachActionListeners() {
    document.querySelectorAll(".btn-edit").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        alert(`Edit kuliner dengan ID: ${id}`);
      });
    });

    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        if (confirm("Apakah Anda yakin ingin menghapus data kuliner ini?")) {
          alert(`Hapus kuliner dengan ID: ${id}`);
        }
      });
    });
  }

  if (tableRetryButton) {
    tableRetryButton.addEventListener("click", fetchKulinerData);
  }

  // Jalankan cek admin dulu
  checkAdminAccess();
});