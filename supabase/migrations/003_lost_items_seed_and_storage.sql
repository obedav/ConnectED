-- ConnectED Lost Items Seed + Storage Setup

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lost-items','lost-items',true,5242880,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];

create policy "lost_items_storage_upload" on storage.objects for insert to authenticated with check (bucket_id = 'lost-items');
create policy "lost_items_storage_read" on storage.objects for select to public using (bucket_id = 'lost-items');
create policy "lost_items_storage_delete" on storage.objects for delete to authenticated using (bucket_id = 'lost-items' and auth.uid()::text = (storage.foldername(name))[1]);

do $$ begin
  if (select count(*) from public.lost_items) = 0 then
    insert into public.lost_items (id,reporter_id,title,description,location_found,status,image_url,created_at) values
    (gen_random_uuid(),null,'Blue Water Bottle','Insulated blue water bottle with a sticker. Has a dent near the bottom.','Science corridor, near Lab 3','missing','https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80',now()-interval '2 days'),
    (gen_random_uuid(),null,'Black Adidas Hoodie','Size M hoodie, name Chidi written inside collar.','Sports hall changing room','found','https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80',now()-interval '3 days'),
    (gen_random_uuid(),null,'Casio Scientific Calculator','Casio FX-991ES Plus, small scratch on screen cover.','Maths block, Room 14','found','https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',now()-interval '1 day'),
    (gen_random_uuid(),null,'Pair of AirPods (Gen 3)','White AirPods, case has a small blue dot sticker.','Library, study area near windows','missing','https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&q=80',now()-interval '5 hours'),
    (gen_random_uuid(),null,'Grey Notebook','A5 grey notebook half full of chemistry notes.',null,'missing','https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80',now()-interval '4 days'),
    (gen_random_uuid(),null,'Red Lunch Box','Red lunch box with black clip, name tag not legible.','Dining hall, table 7','found','https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80',now()-interval '6 hours'),
    (gen_random_uuid(),null,'Black Leather Wallet','Slim black wallet, contains a Year 10 student ID.','Main reception area','found','https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80',now()-interval '1 day'),
    (gen_random_uuid(),null,'PE Kit Bag','Navy drawstring bag, Property of Year 9 on front.','Football pitch changing rooms','claimed','https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',now()-interval '7 days');
  end if;
end; $$;
