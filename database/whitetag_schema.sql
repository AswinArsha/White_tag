create table public.admins (
  id serial not null,
  email character varying(255) not null,
  password_hash character varying(255) not null,
  name character varying(100) not null,
  role character varying(20) null default 'admin'::character varying,
  permissions jsonb null,
  is_active boolean null default true,
  last_login timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint admins_pkey primary key (id),
  constraint admins_email_key unique (email),
  constraint admins_role_check check (
    (
      (role)::text = any (
        array[
          ('super_admin'::character varying)::text,
          ('admin'::character varying)::text,
          ('support'::character varying)::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_admins_active on public.admins using btree (is_active) TABLESPACE pg_default;

create index IF not exists idx_admins_email on public.admins using btree (email) TABLESPACE pg_default;

create index IF not exists idx_admins_role on public.admins using btree (role) TABLESPACE pg_default;

create trigger update_admins_updated_at BEFORE
update on admins for EACH row
execute FUNCTION update_updated_at_column ();
,
create table public.pet_images (
  id serial not null,
  pet_id integer not null,
  original_filename character varying(255) null,
  compressed_filename character varying(255) null,
  original_size_mb numeric(10, 2) null,
  compressed_size_mb numeric(10, 2) null,
  compression_ratio numeric(5, 2) null,
  storage_url character varying(500) null,
  created_at timestamp with time zone null default now(),
  constraint pet_images_pkey primary key (id),
  constraint pet_images_pet_id_fkey foreign KEY (pet_id) references pets (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_pet_images_pet_id on public.pet_images using btree (pet_id) TABLESPACE pg_default;
,
create table public.pets (
  id serial not null,
  user_id integer not null,
  name character varying(100) not null,
  username character varying(50) not null,
  type character varying(20) not null,
  breed character varying(100) null,
  age character varying(20) null,
  color text null,
  description text null,
  photo_url character varying(500) null,
  show_phone boolean null default true,
  show_whatsapp boolean null default true,
  show_instagram boolean null default true,
  show_address boolean null default false,
  qr_code_generated boolean null default false,
  qr_code_url character varying(500) null,
  total_scans integer null default 0,
  last_scanned_at timestamp with time zone null,
  is_active boolean null default true,
  is_lost boolean null default false,
  lost_date timestamp with time zone null,
  found_date timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  whatsapp character varying(20) null,
  instagram character varying(50) null,
  address text null,
  constraint pets_pkey primary key (id),
  constraint pets_username_key unique (username),
  constraint pets_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE,
  constraint check_pets_whatsapp_format check (
    (
      (whatsapp is null)
      or ((whatsapp)::text ~ '^\+?[1-9]\d{1,14}$'::text)
    )
  ),
  constraint check_username_format check (
    ((username)::text ~ '^[a-zA-Z0-9_-]{3,50}$'::text)
  ),
  constraint check_pets_instagram_format check (
    (
      (instagram is null)
      or (
        (instagram)::text ~ '^@?[a-zA-Z0-9._]{1,30}$'::text
      )
    )
  ),
  constraint pets_type_check check (
    (
      (type)::text = any (
        array[
          ('Dog'::character varying)::text,
          ('Cat'::character varying)::text,
          ('Bird'::character varying)::text,
          ('Rabbit'::character varying)::text,
          ('Other'::character varying)::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_pets_active on public.pets using btree (is_active) TABLESPACE pg_default;

create index IF not exists idx_pets_lost on public.pets using btree (is_lost) TABLESPACE pg_default;

create index IF not exists idx_pets_type on public.pets using btree (type) TABLESPACE pg_default;

create index IF not exists idx_pets_user_active on public.pets using btree (user_id, is_active) TABLESPACE pg_default;

create index IF not exists idx_pets_user_id on public.pets using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_pets_username on public.pets using btree (username) TABLESPACE pg_default;

create index IF not exists idx_pets_user_active_type on public.pets using btree (user_id, is_active, type) TABLESPACE pg_default;

create index IF not exists idx_pets_username_active on public.pets using btree (username, is_active) TABLESPACE pg_default;

create index IF not exists idx_pets_whatsapp on public.pets using btree (whatsapp) TABLESPACE pg_default;

create index IF not exists idx_pets_instagram on public.pets using btree (instagram) TABLESPACE pg_default;

create trigger trigger_log_privacy_changes
after
update on pets for EACH row
execute FUNCTION log_privacy_change ();

create trigger update_pets_updated_at BEFORE
update on pets for EACH row
execute FUNCTION update_updated_at_column ();
,
create table public.privacy_changes (
  id serial not null,
  pet_id integer not null,
  user_id integer not null,
  field_name character varying(50) not null,
  old_value boolean null,
  new_value boolean null,
  changed_at timestamp with time zone null default now(),
  ip_address inet null,
  constraint privacy_changes_pkey primary key (id),
  constraint privacy_changes_pet_id_fkey foreign KEY (pet_id) references pets (id) on delete CASCADE,
  constraint privacy_changes_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_privacy_changes_pet_id on public.privacy_changes using btree (pet_id) TABLESPACE pg_default;

create index IF not exists idx_privacy_changes_user_id on public.privacy_changes using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_privacy_changes_changed_at on public.privacy_changes using btree (changed_at) TABLESPACE pg_default;
,
create table public.qr_scans (
  id serial not null,
  pet_id integer not null,
  scanner_ip character varying(45) null,
  scanner_location_lat numeric(10, 8) null,
  scanner_location_lng numeric(11, 8) null,
  scanner_user_agent text null,
  scanner_country character varying(100) null,
  scanner_city character varying(100) null,
  whatsapp_shared boolean null default false,
  whatsapp_shared_at timestamp with time zone null,
  scanned_at timestamp with time zone null default now(),
  constraint qr_scans_pkey primary key (id),
  constraint qr_scans_pet_id_fkey foreign KEY (pet_id) references pets (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_qr_scans_location on public.qr_scans using btree (scanner_location_lat, scanner_location_lng) TABLESPACE pg_default;

create index IF not exists idx_qr_scans_pet_date on public.qr_scans using btree (pet_id, scanned_at) TABLESPACE pg_default;

create index IF not exists idx_qr_scans_pet_id on public.qr_scans using btree (pet_id) TABLESPACE pg_default;

create index IF not exists idx_qr_scans_scanned_at on public.qr_scans using btree (scanned_at) TABLESPACE pg_default;
,
create table public.subscription_plans (
  id serial not null,
  name character varying(100) not null,
  description text null,
  duration_months integer not null,
  amount numeric(10, 2) not null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint subscription_plans_pkey primary key (id),
  constraint subscription_plans_amount_check check ((amount >= (0)::numeric)),
  constraint subscription_plans_duration_check check ((duration_months > 0))
) TABLESPACE pg_default;

create index IF not exists idx_subscription_plans_active on public.subscription_plans using btree (is_active) TABLESPACE pg_default;

create trigger update_subscription_plans_updated_at BEFORE
update on subscription_plans for EACH row
execute FUNCTION update_updated_at_column ();
,
create table public.subscriptions (
  id serial not null,
  user_id integer not null,
  plan_type character varying(20) null default 'annual'::character varying,
  status character varying(20) null default 'pending'::character varying,
  amount numeric(10, 2) not null default 599.00,
  currency character varying(3) null default 'INR'::character varying,
  start_date date not null,
  end_date date not null,
  payment_method character varying(50) null,
  payment_reference character varying(100) null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  plan_id integer null,
  constraint subscriptions_pkey primary key (id),
  constraint subscriptions_plan_id_fkey foreign KEY (plan_id) references subscription_plans (id) on delete set null,
  constraint subscriptions_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE,
  constraint subscriptions_plan_type_check check (
    (
      (plan_type)::text = any (
        array[
          ('annual'::character varying)::text,
          ('monthly'::character varying)::text
        ]
      )
    )
  ),
  constraint subscriptions_status_check check (
    (
      (status)::text = any (
        array[
          ('active'::character varying)::text,
          ('expired'::character varying)::text,
          ('cancelled'::character varying)::text,
          ('pending'::character varying)::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_end_date on public.subscriptions using btree (end_date) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_status on public.subscriptions using btree (status) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_status_end on public.subscriptions using btree (status, end_date) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_user_id on public.subscriptions using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_plan_id on public.subscriptions using btree (plan_id) TABLESPACE pg_default;

create trigger update_subscriptions_updated_at BEFORE
update on subscriptions for EACH row
execute FUNCTION update_updated_at_column ();
,
create table public.support_tickets (
  id serial not null,
  user_id integer null,
  admin_id integer null,
  pet_id integer null,
  subject character varying(200) not null,
  description text not null,
  status character varying(20) null default 'open'::character varying,
  priority character varying(20) null default 'medium'::character varying,
  category character varying(20) null default 'other'::character varying,
  contact_email character varying(255) null,
  contact_phone character varying(20) null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  resolved_at timestamp with time zone null,
  constraint support_tickets_pkey primary key (id),
  constraint support_tickets_pet_id_fkey foreign KEY (pet_id) references pets (id) on delete set null,
  constraint support_tickets_admin_id_fkey foreign KEY (admin_id) references admins (id) on delete set null,
  constraint support_tickets_user_id_fkey foreign KEY (user_id) references users (id) on delete set null,
  constraint support_tickets_category_check check (
    (
      (category)::text = any (
        array[
          ('technical'::character varying)::text,
          ('billing'::character varying)::text,
          ('lost_pet'::character varying)::text,
          ('account'::character varying)::text,
          ('other'::character varying)::text
        ]
      )
    )
  ),
  constraint support_tickets_priority_check check (
    (
      (priority)::text = any (
        array[
          ('low'::character varying)::text,
          ('medium'::character varying)::text,
          ('high'::character varying)::text,
          ('urgent'::character varying)::text
        ]
      )
    )
  ),
  constraint support_tickets_status_check check (
    (
      (status)::text = any (
        array[
          ('open'::character varying)::text,
          ('in_progress'::character varying)::text,
          ('resolved'::character varying)::text,
          ('closed'::character varying)::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_support_tickets_created_at on public.support_tickets using btree (created_at) TABLESPACE pg_default;

create index IF not exists idx_support_tickets_priority on public.support_tickets using btree (priority) TABLESPACE pg_default;

create index IF not exists idx_support_tickets_status on public.support_tickets using btree (status) TABLESPACE pg_default;

create index IF not exists idx_support_tickets_user_id on public.support_tickets using btree (user_id) TABLESPACE pg_default;

create trigger update_support_tickets_updated_at BEFORE
update on support_tickets for EACH row
execute FUNCTION update_updated_at_column ();
,
create table public.users (
  id serial not null,
  email character varying(255) not null,
  password_hash character varying(255) not null,
  name character varying(100) not null,
  phone character varying(20) null,
  whatsapp character varying(20) null,
  instagram character varying(50) null,
  address text null,
  is_active boolean null default true,
  is_demo boolean null default false,
  email_verified boolean null default false,
  email_verified_at timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint check_instagram_format check (
    (
      (instagram is null)
      or (
        (instagram)::text ~ '^@?[a-zA-Z0-9._]{1,30}$'::text
      )
    )
  ),
  constraint check_whatsapp_format check (
    (
      (whatsapp is null)
      or ((whatsapp)::text ~ '^\+?[1-9]\d{1,14}$'::text)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_users_active on public.users using btree (is_active) TABLESPACE pg_default;

create index IF not exists idx_users_email on public.users using btree (email) TABLESPACE pg_default;

create index IF not exists idx_users_phone on public.users using btree (phone) TABLESPACE pg_default;

create index IF not exists idx_users_whatsapp on public.users using btree (whatsapp) TABLESPACE pg_default;

create index IF not exists idx_users_instagram on public.users using btree (instagram) TABLESPACE pg_default;

create index IF not exists idx_users_contact_info on public.users using btree (whatsapp, instagram) TABLESPACE pg_default
where
  (is_active = true);

create trigger trigger_sanitize_contact_info BEFORE INSERT
or
update on users for EACH row
execute FUNCTION sanitize_contact_info ();

create trigger update_users_updated_at BEFORE
update on users for EACH row
execute FUNCTION update_updated_at_column ();

,
create table public.invites (
  id serial not null,
  token character varying(100) not null,
  expires_at timestamp with time zone not null,
  used boolean null default false,
  used_at timestamp with time zone null,
  created_by integer null,
  used_by integer null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint invites_pkey primary key (id),
  constraint invites_token_key unique (token),
  constraint invites_created_by_fkey foreign KEY (created_by) references admins (id) on delete set null,
  constraint invites_used_by_fkey foreign KEY (used_by) references users (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_invites_token on public.invites using btree (token) TABLESPACE pg_default;

create index IF not exists idx_invites_expires_at on public.invites using btree (expires_at) TABLESPACE pg_default;

create trigger update_invites_updated_at BEFORE
update on invites for EACH row
execute FUNCTION update_updated_at_column ();

,
create table public.fulfillment_tasks (
  id serial not null,
  user_id integer not null,
  name character varying(120) not null,
  email character varying(255) not null,
  phone character varying(20),
  pet_name character varying(120),
  pet_username character varying(50),
  stage character varying(30) not null default 'new_signup',
  notes text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint fulfillment_tasks_pkey primary key (id),
  constraint fulfillment_tasks_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE,
  constraint fulfillment_tasks_stage_check check (
    ((stage)::text = any (array[
      ('new_signup'::character varying)::text,
      ('tag_writing'::character varying)::text,
      ('packed'::character varying)::text,
      ('out_for_delivery'::character varying)::text,
      ('delivered'::character varying)::text
    ]))
  )
) TABLESPACE pg_default;

create index IF not exists idx_fulfillment_stage on public.fulfillment_tasks using btree (stage) TABLESPACE pg_default;
create index IF not exists idx_fulfillment_user_id on public.fulfillment_tasks using btree (user_id) TABLESPACE pg_default;
create index IF not exists idx_fulfillment_created_at on public.fulfillment_tasks using btree (created_at) TABLESPACE pg_default;

create trigger update_fulfillment_tasks_updated_at BEFORE
update on fulfillment_tasks for EACH row
execute FUNCTION update_updated_at_column ();
