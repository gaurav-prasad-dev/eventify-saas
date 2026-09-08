-- CreateTable
CREATE TABLE "venues" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100),
    "country" VARCHAR(100) NOT NULL DEFAULT 'India',
    "postal_code" VARCHAR(20),
    "contact_name" VARCHAR(100),
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(20),
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "facilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rules" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_contracts" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "venue_id" UUID NOT NULL,
    "deal_title" VARCHAR(200) NOT NULL,
    "event_name" VARCHAR(200),
    "event_id" UUID,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "total_days" INTEGER NOT NULL,
    "allocated_capacity" INTEGER NOT NULL DEFAULT 0,
    "rental_amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "security_deposit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cleaning_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "electricity_charges" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "other_charges" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(10,2) NOT NULL,
    "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "payment_status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "contract_status" VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    "terms" TEXT,
    "notes" TEXT,
    "contract_url" TEXT,
    "notified_at" TIMESTAMP(3),
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venue_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_seating_layouts" (
    "id" UUID NOT NULL,
    "venue_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "total_seats" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venue_seating_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_seats" (
    "id" UUID NOT NULL,
    "layout_id" UUID NOT NULL,
    "seat_number" VARCHAR(20) NOT NULL,
    "row_number" VARCHAR(20),
    "section" VARCHAR(100) NOT NULL DEFAULT 'General',
    "seat_type" VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    "x_position" DECIMAL(10,2) NOT NULL,
    "y_position" DECIMAL(10,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venue_seats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "venues_organization_id_status_idx" ON "venues"("organization_id", "status");

-- CreateIndex
CREATE INDEX "venue_contracts_organization_id_venue_id_idx" ON "venue_contracts"("organization_id", "venue_id");

-- CreateIndex
CREATE INDEX "venue_seating_layouts_venue_id_idx" ON "venue_seating_layouts"("venue_id");

-- CreateIndex
CREATE INDEX "venue_seats_layout_id_idx" ON "venue_seats"("layout_id");

-- CreateIndex
CREATE UNIQUE INDEX "venue_seats_layout_id_seat_number_key" ON "venue_seats"("layout_id", "seat_number");

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "venues_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_contracts" ADD CONSTRAINT "venue_contracts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_contracts" ADD CONSTRAINT "venue_contracts_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_seating_layouts" ADD CONSTRAINT "venue_seating_layouts_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_seats" ADD CONSTRAINT "venue_seats_layout_id_fkey" FOREIGN KEY ("layout_id") REFERENCES "venue_seating_layouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
