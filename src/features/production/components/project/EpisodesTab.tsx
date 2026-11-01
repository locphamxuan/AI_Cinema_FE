'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { teamService } from '@/services/teamService';
import type { Episode, Season } from '@/types/production';
import { useResource } from '@/hooks/useResource';
import { OPEN_PROJECT, isIn } from '../../lib/capabilities';
import { AddEpisodeModal, AddSeasonModal, EditEpisodeModal, EditSeasonModal } from './EpisodeModals';
import { useProject } from './ProjectContext';
import { SeasonSection } from './SeasonSection';

/** Seasons with their release window, price and status, and the episodes of each with their Creator, prices and dates. */
export function EpisodesTab() {
  const { project, caps } = useProject();
  const [addingSeason, setAddingSeason] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [addingTo, setAddingTo] = useState<Season | null>(null);
  const [editing, setEditing] = useState<{ episode: Episode; season: Season } | null>(null);
  const team = useResource(`team:${project.id}:${project.updatedAt}`, () => teamService.listCreators(project.id));
  const plan = caps.manage && isIn(project.status, OPEN_PROJECT);
  const totalEpisodes = project.seasons.reduce((n, s) => n + s.episodes.length, 0);

  return (
    <div className="space-y-4">
      {plan && (
        <div className="flex justify-end">
          <Button size="sm" variant="secondary" onClick={() => setAddingSeason(true)}>
            Thêm mùa
          </Button>
        </div>
      )}

      {project.seasons.map((season) => (
        <SeasonSection
          key={season.id}
          season={season}
          fee={project.seasonFees.find((fee) => fee.seasonId === season.id)}
          seats={team.data ?? []}
          onAddEpisode={() => setAddingTo(season)}
          onEditSeason={() => setEditingSeason(season)}
          onEditEpisode={(episode) => setEditing({ episode, season })}
        />
      ))}

      {addingSeason && <AddSeasonModal firstNumber={totalEpisodes + 1} nextSeason={project.seasons.length + 1} onClose={() => setAddingSeason(false)} />}
      {editingSeason && <EditSeasonModal season={editingSeason} onClose={() => setEditingSeason(null)} />}
      {addingTo && <AddEpisodeModal season={addingTo} onClose={() => setAddingTo(null)} />}
      {editing && <EditEpisodeModal episode={editing.episode} season={editing.season} onClose={() => setEditing(null)} />}
    </div>
  );
}
