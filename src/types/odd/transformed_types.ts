type OddType = {
    type: string,
    ft_hdp: number[],
    ft_hdp_home: number,
    ft_hdp_away: number,
    ft_ou: number[],
    ft_ou_over: number,
    ft_ou_under: number,
}

type FixtureType = {
    home_team_name: string,
    away_team_name: string,
    site_fixture_id: string,
    upper_team_name: string,
    lower_team_name: string,
    odds: OddType[]
}

type LeagueType = {
    league_name: string,
    fixtures: FixtureType[]
}

export {
    OddType,
    FixtureType,
    LeagueType
}