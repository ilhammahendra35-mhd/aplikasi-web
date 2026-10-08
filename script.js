// ========================================
// KEUANGAN KELUARGA
// script.js
// ========================================

// Mengambil data transaksi dari localStorage
let transactions =
    JSON.parse(localStorage.getItem("familyFinance")) || [];


// ========================================
// ELEMENT HTML
// ========================================

const form = document.getElementById("transactionForm");

const transactionList =
    document.getElementById("transactionList");

const saldoElement =
    document.getElementById("saldo");

const pemasukanElement =
    document.getElementById("totalPemasukan");

const pengeluaranElement =
    document.getElementById("totalPengeluaran");


// ========================================
// FORMAT RUPIAH
// ========================================

function formatRupiah(number) {

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);

}


// ========================================
// FORMAT TANGGAL
// ========================================

function formatTanggal(tanggal) {

    const date = new Date(tanggal);

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

}


// ========================================
// SIMPAN DATA KE LOCAL STORAGE
// ========================================

function saveTransactions() {

    localStorage.setItem(
        "familyFinance",
        JSON.stringify(transactions)
    );

}


// ========================================
// UPDATE DASHBOARD
// ========================================

function updateDashboard() {

    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    transactions.forEach(transaction => {

        if (transaction.jenis === "pemasukan") {

            totalPemasukan += transaction.jumlah;

        } else {

            totalPengeluaran += transaction.jumlah;

        }

    });

    const saldo =
        totalPemasukan - totalPengeluaran;


    // Tampilkan data
    pemasukanElement.textContent =
        formatRupiah(totalPemasukan);

    pengeluaranElement.textContent =
        formatRupiah(totalPengeluaran);

    saldoElement.textContent =
        formatRupiah(saldo);


    // Warna saldo
    if (saldo < 0) {

        saldoElement.style.color = "#dc2626";

    } else {

        saldoElement.style.color = "#0f766e";

    }

}


// ========================================
// TAMPILKAN TRANSAKSI
// ========================================

function renderTransactions() {

    transactionList.innerHTML = "";


    // Jika belum ada transaksi
    if (transactions.length === 0) {

        transactionList.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    Belum ada transaksi.
                </td>
            </tr>
        `;

        updateDashboard();

        return;
    }


    // Urutkan berdasarkan tanggal terbaru
    const sortedTransactions =
        [...transactions].sort(
            (a, b) =>
                new Date(b.tanggal) -
                new Date(a.tanggal)
        );


    sortedTransactions.forEach(transaction => {

        const row =
            document.createElement("tr");


        const isIncome =
            transaction.jenis === "pemasukan";


        const typeClass =
            isIncome
                ? "income"
                : "expense";


        const typeText =
            isIncome
                ? "Pemasukan"
                : "Pengeluaran";


        const sign =
            isIncome
                ? "+"
                : "-";


        row.innerHTML = `
            <td>
                ${formatTanggal(transaction.tanggal)}
            </td>

            <td class="${typeClass}">
                ${typeText}
            </td>

            <td>
                ${transaction.kategori}
            </td>

            <td>
                ${transaction.keterangan || "-"}
            </td>

            <td class="${typeClass}">
                ${sign}
                ${formatRupiah(transaction.jumlah)}
            </td>

            <td>
                <button
                    class="delete-btn"
                    onclick="deleteTransaction(${transaction.id})">
                    Hapus
                </button>
            </td>
        `;


        transactionList.appendChild(row);

    });


    updateDashboard();

}


// ========================================
// TAMBAH TRANSAKSI
// ========================================

form.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        // Ambil nilai form
        const tanggal =
            document.getElementById("tanggal").value;

        const jenis =
            document.getElementById("jenis").value;

        const kategori =
            document.getElementById("kategori").value;

        const jumlah =
            Number(
                document.getElementById("jumlah").value
            );

        const keterangan =
            document.getElementById("keterangan").value;


        // Validasi
        if (!tanggal) {

            alert("Silakan pilih tanggal.");

            return;
        }


        if (!jumlah || jumlah <= 0) {

            alert("Jumlah transaksi harus lebih dari 0.");

            return;
        }


        // Buat transaksi baru
        const transaction = {

            id: Date.now(),

            tanggal: tanggal,

            jenis: jenis,

            kategori: kategori,

            jumlah: jumlah,

            keterangan: keterangan

        };


        // Tambahkan ke array
        transactions.push(transaction);


        // Simpan
        saveTransactions();


        // Reset form
        form.reset();


        // Kembalikan tanggal hari ini
        setToday();


        // Refresh tampilan
        renderTransactions();


        // Notifikasi
        alert("Transaksi berhasil disimpan.");

    }
);


// ========================================
// HAPUS TRANSAKSI
// ========================================

function deleteTransaction(id) {

    const confirmDelete =
        confirm(
            "Apakah Anda yakin ingin menghapus transaksi ini?"
        );


    if (!confirmDelete) {

        return;

    }


    // Hapus transaksi berdasarkan ID
    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    // Simpan perubahan
    saveTransactions();


    // Refresh
    renderTransactions();

}


// ========================================
// SET TANGGAL HARI INI
// ========================================

function setToday() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    document.getElementById("tanggal").value =
        `${year}-${month}-${day}`;

}


// ========================================
// EXPORT DATA KE JSON
// ========================================

function exportData() {

    const data =
        JSON.stringify(
            transactions,
            null,
            2
        );


    const blob =
        new Blob(
            [data],
            {
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "data-keuangan-keluarga.json";


    link.click();


    URL.revokeObjectURL(url);

}


// ========================================
// HITUNG TOTAL TRANSAKSI
// ========================================

function getTotalTransaksi() {

    return transactions.length;

}


// ========================================
// INISIALISASI APLIKASI
// ========================================

setToday();

renderTransactions();
