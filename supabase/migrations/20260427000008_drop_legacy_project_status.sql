-- ============================================================
-- 旧 project_status ENUM/カラム削除
-- サクミル準拠の project_statuses マスタテーブルに統合
-- ============================================================

alter table public.projects drop column status;
drop type project_status;
