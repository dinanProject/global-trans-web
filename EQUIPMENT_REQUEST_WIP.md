# Equipment Request WIP

## Branch / Commit

Frontend branch:

- fix/equipment-request-datetime
- commit terakhir: 89dd941

API:

- development
- merge terakhir: 267e5f7

## Locked Decisions

- 1 request detail = 1 physical equipment unit
- quantity dihapus dari frontend dan API contract
- quantity: 1 hanya internal database
- same unit tidak boleh dipilih dua kali dalam satu request
- request detail wajib punya:
    - equipmentUnitId
    - requiredCapacityValue
    - requiredCapacityUnit
- datetime wajib menyimpan jam dan menit
- assignment harus memakai unit yang dipilih saat request
- replacement dihapus
- completion per assignment
- request statuses:
    - ASSIGNED
    - IN_PROGRESS
    - PARTIALLY_COMPLETED
    - COMPLETED

## Current API State

- quantity cleanup sudah merged ke development
- node --check lolos untuk:
    - approval.js
    - request.js
    - assignment.js
    - monitoring.js

## Current Frontend Problem

Form aktif kehilangan:

- requiredCapacityValue
- requiredCapacityUnit

Akibatnya API menolak save dengan:
"Required capacity value pada detail baris 1 wajib lebih dari 0."

Qty sempat muncul lagi di UI.
Icon equipment sempat broken, lalu terlihat normal setelah unit dipilih.

## Files To Inspect First

- src/app/routes/main/equipment-request/request/request-form-dialog/request-form-dialog.component.html
- src/app/routes/main/equipment-request/request/request-form-dialog/request-form-dialog.component.ts
- src/app/routes/main/equipment-request/request/request.service.ts

## Rules

- baca source aktif penuh sebelum patch
- jangan overwrite satu file penuh
- satu file selesai -> diff -> build/check -> commit
- jangan pakai .patch
- jangan reset/restore tanpa review
