-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "venue_id" UUID NOT NULL,
    "venue_contract_id" UUID,
    "seating_layout_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(250) NOT NULL,
    "description" TEXT NOT NULL,
    "short_description" VARCHAR(500),
    "category" VARCHAR(50) NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "performers" TEXT,
    "age_restriction" VARCHAR(20) NOT NULL DEFAULT 'ALL_AGES',
    "banner_url" TEXT,
    "thumbnail_url" TEXT,
    "gallery_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "total_capacity" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_sessions" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_ticket_tiers" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "seat_type" VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    "price" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "total_quantity" INTEGER NOT NULL,
    "available_quantity" INTEGER NOT NULL,
    "max_per_order" INTEGER NOT NULL DEFAULT 6,
    "sales_start_time" TIMESTAMP(3),
    "sales_end_time" TIMESTAMP(3),
    "description" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_ticket_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_organization_id_status_idx" ON "events"("organization_id", "status");

-- CreateIndex
CREATE INDEX "events_category_status_idx" ON "events"("category", "status");

-- CreateIndex
CREATE UNIQUE INDEX "events_organization_id_slug_key" ON "events"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "event_sessions_event_id_start_time_idx" ON "event_sessions"("event_id", "start_time");

-- CreateIndex
CREATE INDEX "event_ticket_tiers_event_id_status_idx" ON "event_ticket_tiers"("event_id", "status");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_venue_contract_id_fkey" FOREIGN KEY ("venue_contract_id") REFERENCES "venue_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_seating_layout_id_fkey" FOREIGN KEY ("seating_layout_id") REFERENCES "venue_seating_layouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_sessions" ADD CONSTRAINT "event_sessions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_ticket_tiers" ADD CONSTRAINT "event_ticket_tiers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
