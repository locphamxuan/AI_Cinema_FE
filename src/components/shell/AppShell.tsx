'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Film } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { Separator } from '@/components/shadcn/separator';
import { TooltipProvider } from '@/components/shadcn/tooltip';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/shadcn/sidebar';
import { AccountMenu } from '@/features/production/components/shell/AccountMenu';
import { NotificationMenu } from '@/features/production/components/shell/NotificationMenu';
import { useCan } from '@/hooks/useCan';
import { AREAS, PERMISSION, ROLE_LABEL, type Area } from '@/lib/permissions';
import { useAppStore } from '@/store/useAppStore';
import { activeNavHref, NAVIGATION } from './navigation';

/** The sidebar of one area: brand, the groups this account may open, the signed-in account at the foot. */
function AreaSidebar({ area }: { area: Area }) {
  const pathname = usePathname();
  const search = useSearchParams()?.toString() ?? '';
  const can = useCan();
  const user = useAppStore((s) => s.user);
  const groups = NAVIGATION[area]
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.permission || can(i.permission)) }))
    .filter((g) => g.items.length);
  const active = activeNavHref(groups, pathname, search);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={AREAS[area].path}>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Film className="size-4" aria-hidden="true" />
                </span>
                <span className="grid min-w-0 leading-tight">
                  <span className="truncate font-heading text-sm font-bold tracking-tight">AI Cinema</span>
                  <span className="truncate text-xs text-muted-foreground">{AREAS[area].label}</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent role="navigation" aria-label={`Menu ${AREAS[area].label}`}>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={active === href} tooltip={label}>
                    <Link href={href} aria-current={active === href ? 'page' : undefined}>
                      <Icon aria-hidden="true" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="grid min-w-0 px-2 text-xs leading-tight group-data-[collapsible=icon]:hidden">
          <span className="truncate font-medium">{user?.name}</span>
          <span className="truncate text-muted-foreground">{user?.email}</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

/** The page title of the header: the active menu entry, else the area. */
function useTitle(area: Area) {
  const pathname = usePathname();
  const search = useSearchParams()?.toString() ?? '';
  const groups = NAVIGATION[area];
  const href = activeNavHref(groups, pathname, search);
  return groups.flatMap((g) => g.items).find((i) => i.href === href)?.label ?? AREAS[area].label;
}

/**
 * Every back-office area in one frame, after the arhamkhnz/next-shadcn-admin-dashboard layout (MIT): a collapsible
 * sidebar, and a slim header with the sidebar toggle, the page title, notifications, theme and the account.
 */
export function AppShell({ area, children }: { area: Area; children: ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAppStore();
  const can = useCan();
  const title = useTitle(area);
  // The Admin oversees production in the Reviewer area: it reads every project but never edits one (BR-55).
  const oversight = area === 'reviewer' && !can(PERMISSION.PROJECT_MANAGE) && can(PERMISSION.PROJECT_READ_ALL);

  return (
    <TooltipProvider delayDuration={0}>
    <SidebarProvider style={{ '--sidebar-width': '16rem' } as React.CSSProperties}>
      <AreaSidebar area={area} />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 rounded-t-[inherit] border-b border-border bg-background/80 px-4 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" aria-label="Thu gọn hoặc mở menu" />
          <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
          <h1 className="min-w-0 truncate text-sm font-semibold">{title}</h1>
          {oversight && <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">Chế độ giám sát</span>}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {user && <NotificationMenu />}
            <ThemeToggle />
            <AccountMenu
              name={user?.name ?? 'Tài khoản'}
              roleLabel={ROLE_LABEL[user?.role ?? 'user']}
              onLogout={() => {
                logout();
                router.push('/login');
              }}
              profileHref={`/${area}/profile`}
            />
          </div>
        </header>
        <div className="min-w-0 flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
  );
}
