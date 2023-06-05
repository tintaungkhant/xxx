type FixtureType = {
    odd_type: string,
    home_team_name: string,
    away_team_name: string,
    ft_is_home_team_upper: boolean,
    ft_is_away_team_upper: boolean,
    ft_hdp: number[],
    ft_hdp_home: number,
    ft_hdp_away: number,
    ft_ou: number[],
    ft_ou_over: number,
    ft_ou_under: number,
    fh_is_home_team_upper: boolean,
    fh_is_away_team_upper: boolean,
    fh_hdp: number[],
    fh_hdp_home: number,
    fh_hdp_away: number,
    fh_ou: number[],
    fh_ou_over: number,
    fh_ou_under: number,
    site_fixture_id: string
}

type LeagueType = {
    league_name: string,
    fixtures: FixtureType[]
}

export {
    FixtureType,
    LeagueType
}