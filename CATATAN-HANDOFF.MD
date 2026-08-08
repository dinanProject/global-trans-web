Siap hu. Gue jadikan ini catatan handoff final supaya nanti waktu kamu balik dengan feedback UAT/perubahan baru, konteksnya langsung nyambung dan kita nggak mengulang audit dari nol.

FINAL HANDOFF — Equipment Request / Regression & Performance

Project saat ini sudah selesai regression utama dan siap UAT. Prinsip kerja yang dipakai selama pengerjaan: patch kecil/targeted, jangan overwrite full file kecuali perlu, jangan rename existing function, jangan mengarang route/function/field/table/selector, selalu jelas file/lokasi/perubahan, gunakan UtilityService.confirm() / UtilityService.alert(), jangan window.confirm/alert, optimasi load structure sebelum caching, jangan local/sessionStorage untuk performance tanpa bukti, cek redundant HTTP/N+1/payload, satu menu selesai dulu, pending testcase wajib ditutup sebelum DONE, performance Menu + Permission Management di-skip, git manual terminal.

Status modul utama:

- Dashboard = DONE
- Companies = DONE + regression PASS
- Divisions = DONE
- Categories = DONE
- Units = DONE
- Requests = DONE
- Assignments = DONE
- Approvals = DONE
- Monitoring = DONE
- Email = DONE
- User = DONE
- Role = DONE

Companies

- Company Code immutable setelah create.
- Frontend Code disabled saat Edit.
- Backend PUT reject kalau code berubah.
- PUT tidak update code.
- Duplicate code check hanya POST.
- Edit tanpa perubahan = 0 PUT.
- Fresh Client Company provisioning sudah dicek:
    - <CODE>\_REQ
    - <CODE>\_APPR
    - Client approval level 1
    - GTSI approval level 2
- Design debt yang sengaja belum disentuh: Company Type berubah setelah create bisa membuat provisioning approval tidak sinkron.

Assignments

- findAssignments(...) fix.
- workspace endpoint slim.
- unit master lazy-load.
- Assign All = 1 bulk POST, tidak ada per-row POST.
- Start All / Start Operation = 1 bulk POST.
- Complete unit = 1 POST.
- 1-unit flow PASS:
  APPROVED → ASSIGNED → IN_PROGRESS → COMPLETED.
- Completed hilang dari Active, tetap muncul di All.
- stale right-detail saat filter kosong sudah dibereskan.
- Multi-unit testcase juga akhirnya PASS:
    - 2/2 assigned
    - 1/2 completed → request PARTIALLY_COMPLETED
    - satu unit tetap IN_OPERATION
    - request tetap muncul di Active
    - unit terakhir complete → request COMPLETED
    - hilang dari Active, tetap di All.

Approvals
List:

- legacy Detail button dihapus.
- action hanya Review.
- columns: Request | Company | Equipment | Period | Status | Actions.
- desktop width target 22/16/20/17/13/12.
- mobile horizontal-scroll.
- Reset full width mobile.
- responsive list sudah diperbaiki.

Review page:

- route /equipment-request/approvals/:uuid/review
- same component dipakai Client + GTSI.
- initial Review = 1 slim GET.
- nested sidebar benar.
- hard refresh nested route benar.
- tanggal dd/MM/yyyy HH:mm.
- edit schedule tidak auto-recheck.
- Approve baru recheck saat klik.
- conflict → GET review recheck, tetap di page, action tidak dijalankan, single error.
- available → GET review recheck, baru action.
- Client Approve menyimpan schedule ke GTSI.
- Reject tidak recheck availability.
- success alerts spesifik.
- mobile review layout PASS.
- navigation final = same tab.
- action success kembali ke Approvals, list fresh, sidebar benar.
- Approval +N / multi-equipment sudah pernah diuji dan PASS.
- legacy Review modal cleanup sudah clean dari active path.
- RequestDetailDialogComponent jangan dihapus karena Requests masih pakai.

Monitoring
Initial regression target semua PASS:

- initial load hanya 1 /monitoring/overview.
- default ACTIVE:
    - ASSIGNED
    - IN_OPERATION
    - COMPLETED hari ini
- Completed lama tidak ikut ACTIVE.
- icon category dari backend category.icon.
- fallback equipment.svg ada di source; live fallback data tidak tersedia, jadi dianggap pending-data/non-blocker.
- Search debounce PASS.
- Company filter PASS.
- Division filter PASS.
- Equipment filter PASS.
- Status ALL / COMPLETED / ACTIVE PASS.
- Start Date PASS.
- End Date PASS.
- Overdue Only PASS.
- leave page → re-enter = hanya 1 actual /overview, tidak duplicate subscription/HTTP.
- filter options di frontend diperbaiki supaya merge dari response yang sudah pernah dimuat, tanpa endpoint master baru.
- HTML diperbaiki agar Division, Equipment, Start Date, End Date langsung trigger onFilterChange().

Monitoring timezone bug penting yang ditemukan dan sudah diperbaiki:

- sebelumnya toISOString().slice(0,10) membuat completed sekitar 21:xxZ dianggap hari sebelumnya walaupun sudah tanggal berikutnya WIB.
- backend Monitoring sekarang normalisasi date berdasarkan APP_TIMEZONE, fallback Asia/Jakarta.
- nilai env perlu disanitasi dari quote karena environment lokal sempat membaca "Asia/Jakarta" literal.
- hasil akhir terbukti:
  record 2026-08-07T21:09Z menjadi isCompletedToday: true pada 08 Aug WIB.
- summary.completedToday akhirnya konsisten.

Administration — Email

- initial list slim.
- Retry:
    - 1 GET detail untuk preview.
    - Cancel = 0 POST.
    - Continue + confirm = 1 POST retry.
    - local row update.
    - tidak full reload list setelah retry.
- DONE.

Administration — User

- initial = 1 GET /user.
- /user/options lazy-load saat Add/Edit pertama.
- Add kedua tidak GET options ulang.
- Edit = 1 GET detail user.
- no-change Save = 0 PUT.
- no list reload setelah no-change save.
- DONE.

Administration — Role

- initial = 1 GET /role.
- options lazy-load saat Add pertama.
- Add kedua tidak reload options.
- Edit tidak reload options.
- no-change Save = 0 PUT.
- no list reload.
- counts berasal dari role list, tidak N+1 per row.
- Menu + Permission Management performance tetap SKIP.
- DONE.

Permission visibility
Admin Global Reports diuji:

- Reports ditambahkan → logout/login → menu muncul.
- Reports dihapus → menu hilang.
- session/menu refresh tidak nyangkut stale permission.
- PASS.

Global regression

- Console clean = PASS.
- Warning reactive form di Login Logs sudah dibereskan:
    - [disabled]="isStatusLoading" di <select [formControl]> dihapus.
    - statusControl.disable({ emitEvent:false }) saat load status.
    - enable({ emitEvent:false }) di finalize.
    - tidak menambah HTTP.
- 401 = kosong / PASS.
- unexpected 403 = kosong / PASS.
- 404 = kosong / PASS.
- redundant HTTP global = PASS.
- preflight 204 tidak dihitung sebagai duplicate business API.
- mobile major pages = PASS.
- user merasa loading jauh lebih cepat setelah optimasi.

DB
Sebelum UAT, seluruh transaction/test data sudah dibersihkan dengan TRUNCATE dan auto-increment reset. Master/config tetap dipertahankan, terutama:

- companies
- divisions
- equipment categories/units/types
- request statuses/transitions
- approval flows
- users/roles/permissions
- email templates
- lookups

Transaction/log/session yang dibersihkan meliputi request/assignment/approval/history, email outbox, attachment, login log, audit log, refresh token.

Git / delivery
Development dan production sudah selesai oleh user via manual terminal. Workflow yang dipakai:

- git add .
- development dulu
- validate
- merge/push production
- GitHub connector tidak dipakai.

Current state
Project sudah delivered untuk UAT/user testing. Setelah ini kemungkinan masuk fase feedback tambahan: wording, UX minor, edge case data nyata, atau perubahan flow bisnis. Saat ada perubahan baru, jangan langsung refactor besar. Mulai dari current behavior di atas sebagai baseline dan cek apakah request baru memang regression, enhancement, atau perubahan business rule.

Dan yang paling penting: jangan menganggap desain lama yang belum disentuh sebagai bug baru. Contoh paling jelas adalah Company Type after-create vs approval provisioning—itu known design debt, bukan regression yang belum selesai.
